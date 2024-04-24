# Xplor - Wallet Service
This layer is responsible for creating, storing, deleting & sharing the Verifiable Credentials in user's wallet. The Wallet can receive Verifiable Credentials(VCs) from a VC issuer as well. 

## Table of Contents

- [Working Demo](#working-demo)
- [API Documentation](#api-documentation)
- [Pre-requisites](#pre-requisites)
- [Installation](#installation)
- [Running tests](#running-tests)
- [Service Modules](#service-modules)
- [Configurations](#configurations)
- [Deployment](#deployment)
- [Contributing](#contributing)
## Working Demo

Here's a working demo of this service as a Flutter mobile app. The app has all the features of this wallet service implemented.

[Android app](https://playstore.com)

[IOS app](https://apple.com)

[Web app](https://apple.com)


## Pre-requisites
Below is the list of services you need in order to run this service.
- [Mongo DB Instance](https://www.mongodb.com/) to manage data.
- [Xplor Registry Layer](https://github.com/xplor-registry) to generate & receive VCs 
- [AWS S3 Storage Bucket](https://aws.amazon.com/) or any other Storage to manage file storage


## Installation

### Clone or fork this Project

```bash
 git clone REPOSITORY_LINK
```
    
### Setup Environment Variables(.env)
You need to setup the values for the environment variables. Below is the list of required .env variables

```bash
MONGODB_URL=
STORAGE_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
STORAGE_REGION=
REGISTRY_SERVICE_URL=
WALLET_SERVICE_URL=
REDIS_HOST=
REDIS_PORT=
GRAFANA_SERVICE_URL=
```
### Run service using Docker
Make sure you've the latest version of the docker installed in-order to run the application. Run the service with the following command

```bash
 docker compose --build
```


    
## Running Tests

The service has test cases for each module's service functions which you will get triggered on pushing the code to remote. You can run the test with the following command as well:

```bash
  npm test
```

## API Documentation
To view the Swagger API Docs for the service, you can start the service and hit
```{BASE_URL}/api/v1/```. This will open the proper API Documentation of this service.


## Service Modules
This service follows Nest Js framework and the code structure for it. Each feature is divided into a separate module, then each module communicates with one another, seamlessly. The services inside Module is divided into CRUD Services - Create Service, Read Service, Update Service, Delete Service, keeping the code shorter and reusable.

### Main
The main module is the heart of the Nest js service and includes the dependencies and configs of the whole service.

### Wallet
The wallet module is responsible for managing CRUD operations of a wallet in the database. This module contains API endpoints in the controller file.
``` 
src/wallet 
```

### Files
The files module is responsible for managing CRUD operations of a file in database as well Storage. This module contains API endpoints in the controller file.
``` 
src/files 
```

### Verifiable Credential
The Verifiable Credential module is responsible for managing CRUD operations of a VC in database as well Registry layer. This module contains API endpoints in the controller file to CRUD & Share the VC.
``` 
src/verifiable-credential 
```

### Verifiable Credential Access Control
The Verifiable Credential Access Contro module is responsible for managing the access of a VC. This module manages the usage and restrictions over a Verifiable Credential.
``` 
src/vc-access-control 
```

### Redis
This is the caching layer of the service using Redis.
``` 
src/redis
```
## Configuration

System setup revolves around environment variables for ease of configuration. Key points include database settings, authentication parameters, and logging specifics. The `.env.example` file lists all necessary variables.

```bash
MONGODB_URL=
STORAGE_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
STORAGE_REGION=
REGISTRY_SERVICE_URL=
WALLET_SERVICE_URL=
REDIS_HOST=
REDIS_PORT=
GRAFANA_SERVICE_URL=
```

## Deployment

Deploying the Wallet service can be achieved through:

- **Docker**: Create a Docker image and launch your service.
- **Kubernetes**: Use Kubernetes for scalable container management.
- **CI/CD**: Automate deployment with CI/CD tools like Jenkins, GitLab CI, or GitHub Actions.

## Contributing

Contributions are welcomed! Please follow these steps to contribute:

#### 1. Fork the project.
#### 2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
#### 3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
#### 4. Push to the branch (`git push origin feature/AmazingFeature`).
#### 5. Open a pull request.

## License

Distributed under the MIT License. See [LICENSE.md](LICENSE.md) for more information.

## Acknowledgments

- Kudos to all contributors and the NestJS community.
- Appreciation for anyone dedicating time to enhance open-source software.
