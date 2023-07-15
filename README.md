# contact-identifier
The purpose of the project is to identify if there are any existing contacts and link them to the existing one

## Node js typescript project

### Requirements 
Make sure you have docker installed on your system


### set up instructions
1. Clone the repo `git@github.com:abhishuraina/contact-identifier.git`.
2. Run docker-compose up

The docker-compose up will start the server at PORT:5000 (PORT exposed - 5000)

|      API Endpoint to test       |  Method  |                      Payload                     |
|---------------------------------|----------|--------------------------------------------------|
| `http://localhost:5000/identify`|   POST   |  ```{ "email": string, "phoneNumber": number}``` |
