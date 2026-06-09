from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import uuid
import shutil
import os

from models import Item, FeedResponse, Board
from data import items, boards

fclip_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global fclip_model
    try:
        from transformers import CLIPProcessor, CLIPModel
        model_name = "patrickjohncyh/fashion-clip"
        fclip_model = {
            "model": CLIPModel.from_pretrained(model_name),
            "processor": CLIPProcessor.from_pretrained(model_name)
        }
        print("FashionCLIP model loaded at startup")
    except Exception as e:
        print(f"FashionCLIP not available at startup: {e}")
        fclip_model = {"error": str(e)}
    yield

app = FastAPI(title="Gradient API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_model():
    global fclip_model
    return fclip_model

ITEM_LIST = list(items.values())

@app.get("/api/health")
def health():
    model_status = "loaded" if fclip_model and "error" not in fclip_model else "unavailable"
    return {"status": "ok", "model": model_status, "items": len(ITEM_LIST), "boards": len(boards)}

@app.get("/api/feed")
def get_feed(
    cursor: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None),
    curator: Optional[str] = Query(None)
):
    filtered = ITEM_LIST
    if category:
        filtered = [i for i in filtered if i["category"].lower() == category.lower()]
    if curator:
        filtered = [i for i in filtered if i["curator"] == curator]

    start = 0
    if cursor:
        try:
            start = int(cursor)
        except ValueError:
            start = 0

    page = filtered[start:start + limit]
    next_cursor = str(start + limit) if start + limit < len(filtered) else None

    return FeedResponse(items=[Item(**i) for i in page], next_cursor=next_cursor)

@app.get("/api/items/{item_id}")
def get_item(item_id: str):
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return Item(**item)

@app.get("/api/items/{item_id}/similar")
def get_similar(item_id: str, limit: int = 6):
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    same_category = [i for i in ITEM_LIST if i["category"] == item["category"] and i["id"] != item_id]
    results = same_category[:limit]

    if len(results) < limit:
        others = [i for i in ITEM_LIST if i["id"] != item_id and i not in results]
        results.extend(others[:limit - len(results)])

    return [Item(**i) for i in results]

@app.post("/api/search/visual")
async def visual_search(file: UploadFile = File(...), limit: int = 6):
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        from PIL import Image
        query_img = Image.open(filepath).convert("RGB")
        model_data = get_model()

        if "error" in model_data:
            results = ITEM_LIST[:limit]
            return {"query": filename, "results": [Item(**i) for i in results]}

        model = model_data["model"]
        processor = model_data["processor"]

        item_images = []
        valid_items = []
        for i in ITEM_LIST:
            try:
                import requests
                from io import BytesIO
                resp = requests.get(i["image_url"], timeout=5)
                img = Image.open(BytesIO(resp.content)).convert("RGB")
                item_images.append(img)
                valid_items.append(i)
            except Exception:
                continue

        if not item_images:
            results = ITEM_LIST[:limit]
            return {"query": filename, "results": [Item(**i) for i in results]}

        inputs = processor(
            images=[query_img] + item_images,
            return_tensors="pt",
            padding=True
        )
        outputs = model.get_image_features(pixel_values=inputs["pixel_values"])
        query_emb = outputs[0:1]
        item_embs = outputs[1:]
        scores = (query_emb @ item_embs.T).squeeze(0).tolist()
        indexed = list(enumerate(scores))
        indexed.sort(key=lambda x: x[1], reverse=True)
        top = indexed[:limit]
        results = [Item(**valid_items[idx]) for idx, _ in top]

    except Exception as e:
        results = [Item(**i) for i in ITEM_LIST[:limit]]

    return {"query": filename, "results": results}

@app.post("/api/items/{item_id}/like")
def like_item(item_id: str):
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item["likes"] += 1
    return {"likes": item["likes"]}

@app.get("/api/boards")
def get_boards():
    return [Board(**b) for b in boards.values()]

@app.get("/api/boards/{board_id}")
def get_board(board_id: str):
    b = boards.get(board_id)
    if not b:
        raise HTTPException(status_code=404, detail="Board not found")
    board_items = [Item(**items[iid]) for iid in b["items"] if iid in items]
    return {"board": Board(**b), "items": board_items}

@app.post("/api/boards/{board_id}/items/{item_id}")
def add_to_board(board_id: str, item_id: str):
    b = boards.get(board_id)
    if not b:
        raise HTTPException(status_code=404, detail="Board not found")
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    if item_id not in b["items"]:
        b["items"].append(item_id)
        b["item_count"] = len(b["items"])
    return {"status": "added"}

@app.get("/api/curators")
def get_curators():
    curators = set()
    for i in ITEM_LIST:
        curators.add(i["curator"])
    return sorted(list(curators))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
