from __future__ import annotations

import asyncio
import datetime
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.security import get_password_hash
from src.app.db.database import Session
from src.app.db.models.booking import Booking, BookingStatus, RefundStatus
from src.app.db.models.guide_profile import GuideProfile
from src.app.db.models.poe import Poe, PoeStatus
from src.app.db.models.review import Review, ReviewEntityType
from src.app.db.models.tour import SlotStatus, Tour, TourFormat, TourSlot, TourStatus
from src.app.db.models.user import Role, User, UserStatus


@dataclass(frozen=True)
class SeedUser:
    name: str
    surname: str
    patronymic: str | None
    role: Role
    email: str
    password: str
    date_of_birth: datetime.date


USERS = {
    "admin": SeedUser(
        name="Админ",
        surname="Системный",
        patronymic=None,
        role=Role.ADMIN,
        email="admin@example.com",
        password="Admin123!",
        date_of_birth=datetime.date(1990, 1, 1),
    ),
    "guide": SeedUser(
        name="Иван",
        surname="Гидов",
        patronymic=None,
        role=Role.GUIDE,
        email="guide@example.com",
        password="Guide123!",
        date_of_birth=datetime.date(1992, 2, 2),
    ),
    "tourist": SeedUser(
        name="Петр",
        surname="Туристов",
        patronymic=None,
        role=Role.TOURIST,
        email="tourist@example.com",
        password="Tourist123!",
        date_of_birth=datetime.date(1998, 3, 3),
    ),
}


async def get_or_create_user(session: AsyncSession, payload: SeedUser) -> User:
    existing = (
        await session.execute(select(User).where(User.email == payload.email.lower()))
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    user = User(
        name=payload.name,
        surname=payload.surname,
        patronymic=payload.patronymic,
        role=payload.role,
        status=UserStatus.ACTIVE,
        email=payload.email.lower(),
        date_of_birth=payload.date_of_birth,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(user)
    await session.flush()
    return user


async def seed_guide_profile(session: AsyncSession, guide_user: User) -> None:
    existing = await session.get(GuideProfile, guide_user.id)
    if existing is not None:
        return
    session.add(
        GuideProfile(
            user_id=guide_user.id,
            bio="Историк и городской исследователь. Показываю Петербург без банальностей.",
            specialization="История и архитектура",
            languages=["ru", "en"],
            experience=6,
            avatar="https://picsum.photos/seed/guide/300/300",
        ),
    )


async def seed_poes(session: AsyncSession) -> list[Poe]:
    predefined = [
        Poe(
            id="poe_seed_001",
            city_id="city_spb",
            title="Исаакиевский собор",
            description="Крупнейший православный храм с колоннадой и панорамным видом.",
            category="architecture",
            tags=["history", "architecture", "viewpoint"],
            lat=59.9343,
            lng=30.3061,
            address="Исаакиевская пл., 4",
            wheelchair_accessible=True,
            has_ramp=True,
            has_stairs=True,
            duration_minutes=60,
            images=["https://picsum.photos/seed/poe1/800/600"],
            opening_hours=[{"day": "mon-sun", "from": "10:00", "to": "18:00"}],
            status=PoeStatus.ACTIVE,
        ),
        Poe(
            id="poe_seed_002",
            city_id="city_spb",
            title="Новая Голландия",
            description="Остров-парк с современными пространствами и выставками.",
            category="park",
            tags=["walk", "art", "food"],
            lat=59.9299,
            lng=30.2905,
            address="наб. Адмиралтейского канала, 2",
            wheelchair_accessible=True,
            has_ramp=True,
            has_stairs=False,
            duration_minutes=90,
            images=["https://picsum.photos/seed/poe2/800/600"],
            opening_hours=[{"day": "mon-sun", "from": "09:00", "to": "22:00"}],
            status=PoeStatus.ACTIVE,
        ),
        Poe(
            id="poe_seed_003",
            city_id="city_spb",
            title="Эрмитаж",
            description="Один из крупнейших музеев мира с коллекцией мирового искусства.",
            category="museum",
            tags=["museum", "classic", "indoor"],
            lat=59.9398,
            lng=30.3146,
            address="Дворцовая наб., 34",
            wheelchair_accessible=True,
            has_ramp=True,
            has_stairs=True,
            duration_minutes=120,
            images=["https://picsum.photos/seed/poe3/800/600"],
            opening_hours=[{"day": "tue-sun", "from": "11:00", "to": "18:00"}],
            status=PoeStatus.ACTIVE,
        ),
    ]

    result: list[Poe] = []
    for payload in predefined:
        existing = await session.get(Poe, payload.id)
        if existing is not None:
            result.append(existing)
            continue
        session.add(payload)
        result.append(payload)
    await session.flush()
    return result


async def seed_tours_and_slots(
    session: AsyncSession,
    guide_user: User,
) -> tuple[list[Tour], list[TourSlot]]:
    tours_payload = [
        Tour(
            id="tour_seed_001",
            title="Петербург: Классика за 2 часа",
            description="Обзорный маршрут по центру с акцентом на архитектуру и историю.",
            city_id="city_spb",
            guide_id=str(guide_user.id),
            guide_name=f"{guide_user.name} {guide_user.surname}",
            guide_avatar_url="https://picsum.photos/seed/guide/300/300",
            guide_bio="Городские прогулки с историческим контекстом.",
            format=TourFormat.OFFLINE_GUIDED,
            language="ru",
            duration_minutes=120,
            group_size_max=10,
            price_amount=2500,
            price_currency="RUB",
            tags=["history", "architecture"],
            meeting_lat=59.9350,
            meeting_lng=30.3250,
            meeting_address="Невский пр., 35",
            wheelchair_accessible=True,
            avoid_stairs_possible=True,
            cover_image_url="https://picsum.photos/seed/tour1/800/600",
            images=["https://picsum.photos/seed/tour1a/800/600"],
            route_distance_meters=4200,
            route_points_count=7,
            status=TourStatus.PUBLISHED,
        ),
        Tour(
            id="tour_seed_002",
            title="Современный Васильевский остров",
            description="Маршрут о новой урбанистике и старых индустриальных кварталах.",
            city_id="city_spb",
            guide_id=str(guide_user.id),
            guide_name=f"{guide_user.name} {guide_user.surname}",
            guide_avatar_url="https://picsum.photos/seed/guide/300/300",
            guide_bio="Городские прогулки с историческим контекстом.",
            format=TourFormat.GROUP_TOUR,
            language="ru",
            duration_minutes=150,
            group_size_max=12,
            price_amount=2800,
            price_currency="RUB",
            tags=["urban", "walk", "architecture"],
            meeting_lat=59.9441,
            meeting_lng=30.2669,
            meeting_address="м. Василеостровская",
            wheelchair_accessible=True,
            avoid_stairs_possible=False,
            cover_image_url="https://picsum.photos/seed/tour2/800/600",
            images=["https://picsum.photos/seed/tour2a/800/600"],
            route_distance_meters=5600,
            route_points_count=9,
            status=TourStatus.PUBLISHED,
        ),
    ]

    tours: list[Tour] = []
    for payload in tours_payload:
        existing = await session.get(Tour, payload.id)
        if existing is not None:
            tours.append(existing)
            continue
        session.add(payload)
        tours.append(payload)
    await session.flush()

    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    slots_payload = [
        TourSlot(
            id="slot_seed_001",
            tour_id="tour_seed_001",
            starts_at=now + datetime.timedelta(days=1, hours=10),
            ends_at=now + datetime.timedelta(days=1, hours=12),
            available_capacity=8,
            price_amount=2500,
            price_currency="RUB",
            status=SlotStatus.AVAILABLE,
        ),
        TourSlot(
            id="slot_seed_002",
            tour_id="tour_seed_001",
            starts_at=now + datetime.timedelta(days=2, hours=10),
            ends_at=now + datetime.timedelta(days=2, hours=12),
            available_capacity=10,
            price_amount=2500,
            price_currency="RUB",
            status=SlotStatus.AVAILABLE,
        ),
        TourSlot(
            id="slot_seed_003",
            tour_id="tour_seed_002",
            starts_at=now + datetime.timedelta(days=3, hours=14),
            ends_at=now + datetime.timedelta(days=3, hours=16, minutes=30),
            available_capacity=12,
            price_amount=2800,
            price_currency="RUB",
            status=SlotStatus.AVAILABLE,
        ),
    ]
    slots: list[TourSlot] = []
    for payload in slots_payload:
        existing = await session.get(TourSlot, payload.id)
        if existing is not None:
            slots.append(existing)
            continue
        session.add(payload)
        slots.append(payload)
    await session.flush()
    return tours, slots


async def seed_bookings_and_reviews(
    session: AsyncSession,
    tourist: User,
    tours: list[Tour],
) -> None:
    booking_1 = await session.get(Booking, "booking_seed_001")
    if booking_1 is None:
        booking_1 = Booking(
            id="booking_seed_001",
            tour_id=tours[0].id,
            slot_id="slot_seed_001",
            user_id=tourist.id,
            participants_count=2,
            status=BookingStatus.CONFIRMED,
            price_total_amount=5000,
            price_total_currency="RUB",
            payment_id="pay_seed_001",
            payment_url="https://example.com/pay/seed-1",
            contact_phone="+79990000001",
            refund_status=RefundStatus.NOT_REQUIRED,
        )
        session.add(booking_1)

    booking_2 = await session.get(Booking, "booking_seed_002")
    if booking_2 is None:
        session.add(
            Booking(
                id="booking_seed_002",
                tour_id=tours[1].id,
                slot_id="slot_seed_003",
                user_id=tourist.id,
                participants_count=1,
                status=BookingStatus.PENDING_PAYMENT,
                price_total_amount=2800,
                price_total_currency="RUB",
                payment_id="pay_seed_002",
                payment_url="https://example.com/pay/seed-2",
                contact_phone="+79990000002",
            ),
        )

    review_tour = await session.get(Review, "review_seed_001")
    if review_tour is None:
        session.add(
            Review(
                id="review_seed_001",
                entity_type=ReviewEntityType.TOUR,
                entity_id=tours[0].id,
                user_id=tourist.id,
                user_name=tourist.name,
                booking_id="booking_seed_001",
                rating=5,
                text="Очень насыщенная экскурсия, темп комфортный.",
                accessibility_rating=5,
            ),
        )

    review_poe = await session.get(Review, "review_seed_002")
    if review_poe is None:
        session.add(
            Review(
                id="review_seed_002",
                entity_type=ReviewEntityType.POE,
                entity_id="poe_seed_001",
                user_id=tourist.id,
                user_name=tourist.name,
                rating=4,
                text="Красивое место, лучше приходить в будни.",
                accessibility_rating=4,
            ),
        )


async def main() -> None:
    async with Session() as session:
        await get_or_create_user(session, USERS["admin"])
        guide = await get_or_create_user(session, USERS["guide"])
        tourist = await get_or_create_user(session, USERS["tourist"])
        await seed_guide_profile(session, guide)
        await seed_poes(session)
        tours, _ = await seed_tours_and_slots(session, guide)
        await seed_bookings_and_reviews(session, tourist, tours)
        await session.commit()

    print("Seed completed.")
    print("Accounts:")
    print(f"  admin:   {USERS['admin'].email} / {USERS['admin'].password}")
    print(f"  guide:   {USERS['guide'].email} / {USERS['guide'].password}")
    print(f"  tourist: {USERS['tourist'].email} / {USERS['tourist'].password}")


if __name__ == "__main__":
    asyncio.run(main())
