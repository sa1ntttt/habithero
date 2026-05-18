from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings


# For Neon (and other cloud Postgres):
# - statement_cache_size=0 disables prepared statement caching (avoids pgbouncer issues)
# - pool_pre_ping checks connection is alive before each use (recovers from compute auto-suspend)
# - pool_recycle drops connections older than 5 min (Neon idles them out)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

AsyncSessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass
