from src.app.db.models.route import Route, RoutePoint
from src.app.repositories.base import BaseRepository


class RouteRepository(BaseRepository[Route]):
    model = Route

    async def create_with_points(self, route: Route, points: list[RoutePoint]) -> Route:
        self.session.add(route)
        self.session.add_all(points)
        await self.session.commit()
        await self.session.refresh(route)
        return route
