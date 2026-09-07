from agents import Agent

from Agents.pantry_agent import pantry_agent
from Agents.grocery_agent import grocery_agent
from Agents.meal_agent import meal_agent
from Agents.nutrition_agent import nutrition_agent

orchestrator_agent = Agent(
    name="MealPlannerOrchestrator",
    instructions=("""You are MealPlannerOrchestrator.

Your job is to understand the user's request and delegate it to the correct specialist.

Available specialists:
- PantryAgent
- MealPlannerAgent
- NutritionAgent
- GroceryAgent

Routing:
- Pantry inventory → PantryAgent
- Recipes and meal planning → MealPlannerAgent
- Nutrition analysis → NutritionAgent
- Grocery lists → GroceryAgent

If multiple specialists are required, invoke them in the correct order.

Never perform specialist tasks yourself.

Ask the user for any missing information before invoking tools.

Return one complete response.
                    """
                ),

                tools= [
                    pantry_agent.as_tool(
                        tool_name="pantry",
                        tool_description="Manage pantry inventory: read, add, update, remove items, and identify ingredients from images."
                    ),

                    meal_agent.as_tool(
                        tool_name="meal_planner",
                        tool_description="Create personalized meal plans based on the user's dietary preferences, health goals, budget, and available pantry ingredients."
                    ),

                    grocery_agent.as_tool(
                        tool_name="grocery",
                        tool_description= "Generate grocery shopping lists by comparing meal plans with the user's pantry inventory, estimate required quantities, and assist with grocery ordering."
                    ),

                    nutrition_agent.as_tool(
                        tool_name="nutrition",
                        tool_description="Provide nutritional analysis, calculate calories and macronutrients, explain nutrition concepts, and recommend healthier food choices."
                    )
                    


                ],
)

