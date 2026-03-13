# Real-Time Emergency Response Triage Assistant – Backend

## Render Deployment (FastAPI Web Service)

- **Service type**: Web Service
- **Root directory**: `backend`
- **Environment**: Python
- **Build command**: `pip install -r requirements.txt`
- **Start command**: `bash start.sh`

### Expected structure on Render

```text
backend/
  app/
    main.py
    triage_engine.py
    context_pruning.py
    rag_pipeline.py
    embeddings.py
  requirements.txt
  start.sh
```

The FastAPI application instance is exposed as `app` in `app/main.py`, so Render
can run it with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Local development

From the `backend` directory:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

