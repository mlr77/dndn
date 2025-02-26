# app/redis_client.py
import json
import redis.asyncio as redis
from typing import Dict, Any, Optional

class RedisClient:


def __init__(self, host=None, port=None, password=None, db=0):
    host = host or os.getenv("REDIS_HOST", "localhost")
    port = port or int(os.getenv("REDIS_PORT", "6379"))
    password = password or os.getenv("REDIS_PASSWORD", "")

    self.redis = redis.Redis(
        host=host,
        port=port,
        password=password,
        db=db,
        decode_responses=True
    )

    async def save_notebook(self, notebook_id: str, notebook_data: Dict[str, Any]) -> bool:
        """Save a notebook to Redis"""
        key = f"{self.notebook_prefix}{notebook_id}"
        await self.redis.set(key, json.dumps(notebook_data))
        return True

    async def get_notebook(self, notebook_id: str) -> Optional[Dict[str, Any]]:
        """Get a notebook from Redis"""
        key = f"{self.notebook_prefix}{notebook_id}"
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None

    async def delete_notebook(self, notebook_id: str) -> bool:
        """Delete a notebook from Redis"""
        key = f"{self.notebook_prefix}{notebook_id}"
        await self.redis.delete(key)
        return True

    async def get_all_notebooks(self) -> Dict[str, Dict[str, Any]]:
        """Get all notebooks from Redis"""
        keys = await self.redis.keys(f"{self.notebook_prefix}*")
        result = {}

        for key in keys:
            notebook_id = key.replace(self.notebook_prefix, "")
            notebook_data = await self.get_notebook(notebook_id)
            if notebook_data:
                result[notebook_id] = notebook_data

        return result