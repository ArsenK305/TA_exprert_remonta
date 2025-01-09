from fastapi import FastAPI
import sqlite3
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Разрешить фронтенд
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)


@app.get("/analytics")
def get_analytics():
    query = """
    SELECT 
        strftime('%Y-%m', DateCreated) AS Month, 
        e.FirstName || ' ' || e.LastName AS Employee,
        SUM(CASE WHEN d.Type = 'Estimate' THEN 1 ELSE 0 END) AS EstimateCount,
        SUM(CASE WHEN d.Type = 'Contract' THEN 1 ELSE 0 END) AS ContractCount,
        CASE 
            WHEN SUM(CASE WHEN d.Type = 'Contract' THEN 1 ELSE 0 END) = 0 THEN 0
            ELSE ROUND(
                CAST(SUM(CASE WHEN d.Type = 'Estimate' THEN 1 ELSE 0 END) AS FLOAT) /
                SUM(CASE WHEN d.Type = 'Contract' THEN 1 ELSE 0 END) * 100, 2
            )
        END AS ConversionPercent
    FROM 
        Documents d
    JOIN 
        Employees e ON d.ResponsibleEmployee = e.ID
    GROUP BY 
        strftime('%Y-%m', DateCreated), 
        e.ID
    ORDER BY 
        Month, Employee;
    """

    try:
        # Подключение
        conn = sqlite3.connect("../frontend/analytics_test/react-app/public/database.db")
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()

        # Результат в виде JSON
        columns = ["Month", "Employee", "EstimateCount", "ContractCount", "ConversionPercent"]
        result = [dict(zip(columns, row)) for row in rows]

        return JSONResponse(content=result)
    except sqlite3.Error as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
