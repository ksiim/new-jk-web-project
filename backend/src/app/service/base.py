from typing import Generic, TypeVar

RepositoryT = TypeVar("RepositoryT")


class BaseService(Generic[RepositoryT]):
    def __init__(self, repository: RepositoryT) -> None:
        self.repository = repository
