from typing import Annotated

from fastapi import Depends
from pydantic import BaseModel, Field

from src.app.core.settings import get_project_settings

project_settings = get_project_settings()

class PaginationParams(BaseModel):
    page: int = Field(
        default=1,
        ge=1,
        description="Page number",
    )
    limit: int = Field(
        default=project_settings.DEFAULT_QUERY_LIMIT,
        ge=1,
        le=100,
        description="Maximum number of records to return",
    )

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.limit


PaginationDep = Annotated[PaginationParams, Depends(PaginationParams)]
