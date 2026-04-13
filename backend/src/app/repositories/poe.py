from collections.abc import Sequence

from sqlalchemy import select

from src.app.db.models.poe import Poe
from src.app.repositories.base import BaseRepository


class PoeRepository(BaseRepository[Poe]):
    model = Poe

    async def list_candidates(
        self,
        *,
        city_id: str | None = None,
        category: str | None = None,
        wheelchair_accessible: bool | None = None,
        avoid_stairs: bool | None = None,
    ) -> Sequence[Poe]:
        statement = select(Poe)
        if city_id:
            statement = statement.where(Poe.city_id == city_id)
        if category:
            statement = statement.where(Poe.category == category)
        if wheelchair_accessible is not None:
            statement = statement.where(Poe.wheelchair_accessible == wheelchair_accessible)
        if avoid_stairs:
            statement = statement.where(Poe.has_stairs.is_(False))
        result = await self.session.execute(statement)
        return result.scalars().all()
