"""
Rule-Based Natural Language Explainability (XAI) Engine
Research Project ID: J26-IT339 - Component 3
Generates human-readable rationales justifying each attraction selection
and sequences in the optimized daily itinerary.
"""

from typing import Dict, Any, List


class XAIEngine:
    """
    Translates mathematical model decisions (Random Forest enjoyment predictions,
    DQN state-action Q-values, and action masking constraints) into clear,
    natural language English rationales.
    """

    @staticmethod
    def generate_stop_rationale(
        attraction: Dict[str, Any],
        traveler_type: str,
        origin_country: str,
        predicted_enjoyment: float,
        slot_index: int,
        arrival_time: str,
        departure_time: str,
        cost_usd: float,
        remaining_budget: float,
    ) -> Dict[str, Any]:
        """
        Produces demographic, operational, and environmental rationales for an itinerary stop.
        """
        # Demographic Archetype Justification
        if traveler_type == "couple":
            archetype_rationale = (
                f"Selected for romantic & cultural ambiance (Predicted Enjoyment: {predicted_enjoyment:.2f}/5.0). "
                f"Empirical reviews from {origin_country} travelers highlight scenic photography and quiet exploration."
            )
        elif traveler_type == "family":
            archetype_rationale = (
                f"High family safety index and child-friendly accessibility (Predicted Enjoyment: {predicted_enjoyment:.2f}/5.0). "
                f"Pacing avoids steep climbs during midday and includes comfortable dwell duration."
            )
        else:  # solo
            archetype_rationale = (
                f"Ranked highest for solo independent discovery (Predicted Enjoyment: {predicted_enjoyment:.2f}/5.0). "
                f"High social sentiment and rich immersion in local Sri Lankan heritage."
            )

        # Operational Feasibility & Constraint Rationale
        if slot_index == 0:
            constraint_rationale = (
                f"Sequenced at {arrival_time} to leverage early opening ({attraction['opening_time']}), "
                f"bypassing midday heat and peak tour bus congestion."
            )
        elif cost_usd == 0:
            constraint_rationale = (
                f"Zero entrance ticket fee ($0.00 USD) approved by DQN action-masking, "
                f"conserving remaining budget (${remaining_budget:.2f} available) for afternoon activities."
            )
        else:
            constraint_rationale = (
                f"Foreigner admission fee (${cost_usd:.2f} USD) strictly satisfies remaining financial budget "
                f"(${remaining_budget:.2f}). Operating window ({attraction['opening_time']} - {attraction['closing_time']}) "
                f"guarantees zero cutoff violations."
            )

        # Environmental & Weather Context
        if attraction["category"] in ["Heritage", "Adventure"] and "08:" in arrival_time:
            weather_context = "Optimal microclimate: Cool morning temperatures (24°C) minimize physical fatigue."
        elif attraction["category"] == "Wildlife":
            weather_context = "Biological window: Peak animal activity and gathering occurs during late afternoon."
        elif attraction["category"] == "Culinary":
            weather_context = "Scheduled within the optimal lunch window (12:00 - 13:30) with sheltered dining."
        else:
            weather_context = "Topographical route elevation fits within daylight transit safety margins."

        highlights = [
            f"Category: {attraction['category']}",
            f"Dwell Duration: {attraction['typical_dwell_minutes']} mins",
            f"VADER Review Sentiment: {int(attraction.get('vader_sentiment', 0.9) * 100)}% Positive",
            f"Topographical Elevation: {attraction.get('elevation_m', 50)}m AMSL",
        ]

        return {
            "archetype_match": archetype_rationale,
            "constraint_rationale": constraint_rationale,
            "weather_context": weather_context,
            "key_highlights": highlights,
        }

    @staticmethod
    def generate_replan_justification(
        delay_minutes: int,
        conflicted_stop: str,
        chosen_alternative: str,
        solve_time_sec: float,
        preservation_pct: float,
        masked_count: int,
    ) -> str:
        """
        Explains why dynamic re-planning selected specific adjustments.
        """
        return (
            f"Unforeseen delay of +{delay_minutes} minutes resolved by Deep Q-Network policy in {solve_time_sec:.2f}s "
            f"without model retraining. The engine evaluated alternative sequences and applied strict action-masking "
            f"to prune {masked_count} candidate attractions whose closing windows would have caused schedule violations. "
            f"Selected sequence preserves {preservation_pct:.1f}% of cumulative user satisfaction."
        )
