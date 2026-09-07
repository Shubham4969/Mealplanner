from .profile_table import UserProfile


def get_user_profile(session, user_id):

    profile = (
        session.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if profile is None:
        return None

    return {
        "name": profile.name,
        "age": profile.age,
        "sex": profile.sex,
        "height": profile.height,
        "weight": profile.weight,
        "goal": profile.goal,
        "activity_level": profile.activity_level,
        "diet_type": profile.diet_type,
        "meals_per_day": profile.meals_per_day,
        "budget": profile.budget,
        "allergies": profile.allergies,
        "disliked_foods": profile.disliked_foods,
        "favorite_foods": profile.favorite_foods,
        "health_considerations": profile.health_considerations,
        "daily_schedule": profile.daily_schedule,
        "cuisine_preferences": profile.cuisine_preferences,
    }


def update_user_profile(session, user_id, data):

    profile = (
        session.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if profile is None:
        profile = UserProfile(user_id=user_id)
        session.add(profile)

    for field, value in data.items():

        if hasattr(profile, field) and value is not None:
            setattr(profile, field, value)

    session.commit()

    return profile
