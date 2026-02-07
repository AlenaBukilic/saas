import os
from fastapi import FastAPI, Depends
from fastapi.responses import PlainTextResponse
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI

app = FastAPI()

clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)


@app.get("/api", response_class=PlainTextResponse)
def idea(creds: HTTPAuthorizationCredentials = Depends(clerk_guard)):
    user_id = creds.decoded["sub"]
    client = OpenAI()
    prompt = [
        {"role": "user", "content": "Reply with a new business idea for AI Agents, formatted with headings, sub-headings and bullet points. Keep it to the point and concise."}
    ]
    response = client.chat.completions.create(model="gpt-5-nano", messages=prompt, stream=False)
    return response.choices[0].message.content or ""
