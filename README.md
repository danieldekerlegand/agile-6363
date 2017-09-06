# agile-6363
This is simple question bank web application which allows administrators and teachers to manage classes and quizzes and allows students to take quizzes and track their grades and class progress. The application is written in Java and JavaScript using the Spring framework for the backend and React for the frontend.

## Installing Dependencies
Before installing the application, first you must make sure to have the following dependencies installed on your computer:
* Java 1.8 (JDK 8)
* Maven

You can follow [this guide](http://www.baeldung.com/install-maven-on-windows-linux-mac) if you have any trouble during the installation steps.

## Installing and Running the Application
To install this application, clone the application using ```git clone https://github.com/danieldekerlegand/agile-6363.git``` and navigate into the directory. If you have correctly installed Java and Maven, starting the application should be as simple as running the command ```mvn spring-boot:run```. In order to view the web application, navigate to ```localhost:8080``` which is the default port for Spring apps. In order to stop the server, execute ```CTRL + C``` in the terminal.

If you only want to compile the project, you can use ```mvn compile``` to generate classfiles or ```mvn package``` to generate a JAR file.
## Writing and Running Unit Tests
Tests are located in the /src/test directory and can be run using the ```mvn test``` command.
## Some Helpful Resources
* [Building Java Projects with Maven](https://spring.io/guides/gs/maven/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Getting Started with Spring Boot, Travis, and Heroku](http://felippepuhle.com.br/getting-started-with-spring-boot-travis-and-heroku/) 
