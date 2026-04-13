from enum import Enum
from math import ceil
from typing import Generic, TypeVar

from fastapi import Form
from pydantic import BaseModel
from sqlmodel import Field, SQLModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int

    @classmethod
    def create(cls, page: int, limit: int, total: int) -> "PaginationMeta":
        return cls(
            page=page,
            limit=limit,
            total=total,
            pages=ceil(total / limit) if total else 0,
        )


class ListResponse(BaseModel, Generic[T]):  # noqa: UP046
    data: list[T]
    meta: PaginationMeta
    error: None = None


class DetailResponse(BaseModel, Generic[T]):  # noqa: UP046
    data: T
    meta: dict = {}
    error: None = None


class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class FilePath(SQLModel):
    file_path: str


class FileUploadResponse(SQLModel):
    object_key: str
    file_url: str


class LoginType(str, Enum):
    user = "user"
    organization = "organization"

class OAuth2PasswordRequestFormWithLoginType:
    def __init__(
        self,
        username: str = Form(...),
        code: str = Form(...),
        grant_type: str | None = Form(None),
        scope: str = Form(""),
        client_id: str | None = Form(None),
        client_secret: str | None = Form(None),
        login_type: LoginType = Form(default=LoginType.user),  # noqa: B008
    ) -> None:
        self.username = username
        self.code = code
        self.grant_type = grant_type
        self.scopes = scope.split()
        self.client_id = client_id
        self.client_secret = client_secret
        self.login_type = login_type
