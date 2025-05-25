# Fuel Quota Management Backend

## Quick Start

1. **Clone the repository and navigate to the backend folder:**
   ```powershell
   git clone <repo-url>
   cd backend
   ```

2. **Configure the database:**
   - Create a new database (e.g., `fuel_quota_db`)
   - Update `src/main/resources/application.properties` with your database connection details

3. **Build the project:**
   ```powershell
   ./mvnw clean install
   ```

4. **Run the application:**
   ```powershell
   ./mvnw spring-boot:run
   ```

   Or run the JAR file directly:
   ```powershell
   java -jar target/fuelQuotaManagementSystem-0.0.1-SNAPSHOT.jar
   ```

## Configuration

- **Database**: Update connection settings in `src/main/resources/application.properties`
- **Server Port**: Default is 8080, can be changed in `application.properties`

## Requirements

- Java 11 or higher
- Maven (included via wrapper)
- Database (MySQL/PostgreSQL)

The API will be available at `http://localhost:8080`