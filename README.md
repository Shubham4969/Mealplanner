# Meal Planner AI — Personalized AI Meal Planning

An AI-powered meal planning application that helps users organize meals, analyze nutrition, manage pantry inventory, and plan grocery shopping using personalized preferences and specialized AI agents.

## About the Project

Meal Planner AI combines large language models (LLMs), a multi-agent architecture, retrieval-augmented generation (RAG), and persistent storage to deliver personalized meal-planning assistance.

The project explores the practical application of AI agents, knowledge retrieval, memory systems, and backend engineering in a mobile application.

## Features

- **Personalized Meal Plans:** Generate meal plans based on user preferences and dietary requirements.
- **Nutrition Analysis:** Analyze meals and provide nutritional insights.
- **Pantry Management:** Identify and manage available ingredients.
- **Grocery Planning:** Generate shopping lists based on planned meals and required ingredients.
- **Recipe Retrieval:** Retrieve relevant recipe information using a RAG pipeline.
- **Long-Term Memory:** Retain relevant user preferences across interactions.
- **Voice Assistant:** Support voice-based interaction.
- **Image-Based Pantry Recognition:** Identify food items from pantry images.
- **User Authentication:** Associate application data with individual user accounts and profiles.

Confirm that each feature is implemented and working before presenting it as complete.

## Technology Stack

| Layer | Technologies |
|---|---|
| Mobile frontend | React Native, Expo, TypeScript |
| Backend | Python, FastAPI |
| Relational database | PostgreSQL |
| Vector database | Qdrant |
| Memory system | Mem0 |
| Retrieval pipeline | LangChain, embeddings, BM25 hybrid retrieval |
| AI models | OpenAI models |
| Authentication | Firebase Authentication |
| Deployment | Render, EAS Build |

## Architecture

The application uses a mobile frontend connected to a backend API. The backend coordinates specialized agents and integrates with the relevant data and retrieval services.

```text
             Mobile Application
              React Native / Expo
                      |
                      v
                 FastAPI API
                      |
                      v
               Agent Orchestrator
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      Meal Agent  Pantry Agent  Nutrition Agent
                      |
                 Grocery Agent
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      PostgreSQL    Qdrant       Mem0
      User Data   Recipe Search  Memory
```

*This is a conceptual overview. Adjust the connections to reflect the actual calls and integrations in your code.*

## Multi-Agent System

The application organizes its AI functionality into specialized components:

- **MealPlannerAgent:** Handles meal-planning and recipe-related requests.
- **PantryAgent:** Manages pantry inventory and ingredient-related requests.
- **NutritionAgent:** Processes nutrition-analysis requests.
- **GroceryAgent:** Handles grocery-list generation.
- **Orchestrator:** Selects the appropriate agent or tool for each request.

Separating these responsibilities is intended to make the application easier to maintain, test, and extend.

## Retrieval-Augmented Generation (RAG)

The recipe retrieval pipeline provides relevant knowledge to support LLM responses.

Its general workflow is:

1. Load recipe documents.
2. Divide documents into smaller text chunks.
3. Generate embeddings for those chunks.
4. Store the vectors in Qdrant.
5. Retrieve relevant content in response to a query.
6. Combine semantic vector retrieval with BM25 keyword retrieval.
7. Provide the retrieved context to the language model.

The hybrid approach aims to combine semantic matching with keyword-based search. Its actual effectiveness should be established through retrieval tests.

## Database and Memory Design

**PostgreSQL — Structured application data**

Used for information such as user profiles, conversation history, pantry data, and other persistent records.

**Qdrant — Vector retrieval**

Stores vector representations of recipe content and supports similarity-based retrieval.

**Mem0 — Long-term memory**

Provides memory functionality for retaining relevant user preferences and contextual information.

Each component has a different role in the application and should be documented according to its actual usage.

## Installation and Setup

### Prerequisites

- Python version compatible with the backend dependencies.
- Node.js and npm.
- Expo development tools.
- Docker, if required by your database setup.
- The necessary API credentials and service configurations.

### Step 1: Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Meal_Planner
```

### Step 2: Configure the Python backend

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

If your repository contains a `requirements.txt` file, install the dependencies with:

```bash
pip install -r requirements.txt
```

Create a local `.env` file containing the required configuration values. Document the variable names separately in `.env.example`, without including actual secrets.

If `api.py` contains your FastAPI application object named `app`, you can start the development server with:

```bash
uvicorn api:app --reload
```

Use the actual module name and application entry point if they differ.

### Step 3: Run the mobile application

```bash
cd Mobile
npm install
npx expo start
```

Follow the Expo instructions to open the application on a compatible device or emulator.

### Step 4: Start the required services

Configure PostgreSQL, Qdrant, Firebase Authentication, the required LLM credentials, and the backend URL.

Use the configuration variables expected by your actual code. Follow your repository's Docker or deployment instructions if provided.

## Environment Configuration

Include an `.env.example` file listing the required environment variables and explaining their purpose.

Keep real API keys, passwords, Firebase service-account credentials, and other sensitive information out of GitHub.

## API Documentation

FastAPI can provide interactive API documentation at these routes when its documentation endpoints are enabled:

- Swagger UI: `/docs`
- ReDoc: `/redoc`

Document your actual endpoints, request and response formats, authentication requirements, and error-handling behavior.

## Testing and Evaluation

A successful LLM response alone does not establish that the system is reliable. Evaluate the application against repeatable test cases.

Recommended areas include:

- Valid meal-plan JSON generation.
- Dietary restrictions and day-specific food preferences.
- Ingredient exclusions and allergy-related constraints.
- Recipe retrieval relevance.
- Pantry inventory consistency.
- Authentication and user-profile persistence.
- Correct agent routing.
- Error recovery and API reliability.
- Response latency and model usage costs.

Publish measured results only after running the tests. Include the test methodology and the number of cases evaluated so readers can interpret the results.

## Current Limitations

Describe the issues that still affect the current implementation. Areas worth investigating include:

- Reliable enforcement of dietary and day-specific food restrictions.
- Handling malformed model responses and unsuccessful retries.
- Recipe retrieval quality.
- LLM latency, usage costs, and external API failures.
- The accuracy and verification of nutritional information.

Keep only the limitations that are relevant to the current code.

## Future Work

Potential improvements include:

- Automated evaluation and regression testing.
- More reliable meal-level repair and constraint validation.
- Measurable improvements to retrieval quality.
- Structured logging and monitoring.
- Better API failure recovery.
- Reduced inference costs and response latency.
- Improved deployment automation.

## Security

- Exclude `.env` files, API keys, private credentials, and personal user data from version control.
- Validate inputs and enforce application constraints on the backend.
- Apply appropriate authentication and authorization to user-specific endpoints.
- Avoid placing sensitive information in logs.
- Review dependency and deployment security before production use.

## Author

Developed as an AI engineering portfolio project focused on multi-agent systems, RAG, LLM integration, persistent memory, backend engineering, and mobile application development.

## License

Add an appropriate open-source license if you intend to distribute the project publicly.
