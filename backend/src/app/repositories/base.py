from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _select(self) -> Select[tuple[ModelT]]:
        return select(self.model)

    async def get_by_id(self, entity_id: Any) -> ModelT | None:
        return await self.session.get(self.model, entity_id)

    async def get_one_by(self, **filters: Any) -> ModelT | None:
        statement = self._select().filter_by(**filters)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_and_count(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> tuple[Sequence[ModelT], int]:
        statement = self._select().filter_by(**filters).offset(skip).limit(limit)
        items = (await self.session.execute(statement)).scalars().all()

        total_statement = select(func.count()).select_from(self.model).filter_by(**filters)
        total = (await self.session.execute(total_statement)).scalar_one()
        return items, total

    async def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def delete(self, entity: ModelT) -> bool:
        await self.session.delete(entity)
        await self.session.commit()
        return True
