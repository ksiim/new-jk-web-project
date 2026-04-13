from typing import Generic, TypeVar

RepositoryT = TypeVar("RepositoryT")


class BaseService(Generic[RepositoryT]):  # noqa: UP046
    def __init__(self, repository: RepositoryT) -> None:
        self.repository = repository
