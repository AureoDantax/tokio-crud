# Tokio CRUD App

## Projeto Frontend/Backend

Este projeto é composto por uma aplicação frontend desenvolvida em Angular e um backend em Java. Abaixo estão as instruções para configurar e executar o projeto.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (normalmente instalado com o Node.js)
- [Angular CLI](https://angular.io/cli) (versão 19)
- [JDK](https://www.oracle.com/java/technologies/javase-downloads.html) (versão 17 ou superior)
- [Maven](https://maven.apache.org/download.cgi) (para o backend)

### Instalação

#### Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

#### Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências com Maven:
   ```bash
   mvn clean install
   ```

### Executando o projeto

#### Frontend (modo de desenvolvimento)

1. Na pasta `frontend`, execute:
   ```bash
   npm start
   ```
   
   Isso iniciará o servidor de desenvolvimento Angular com o proxy configurado.
   A aplicação estará disponível em `http://localhost:4200/`.

#### Backend

1. Na pasta `backend`, execute:
   ```bash
   mvn spring-boot:run
   ```

   O servidor backend estará disponível de acordo com a configuração definida no application.yml.


### Estrutura do Projeto

- **Frontend**: Aplicação Angular 19
  - Configurada com proxy para redirecionar chamadas de API para o backend durante o desenvolvimento
  - Arquitetura Modular com componentes standAlone

- **Backend**: Aplicação Java
  - Spring Framework
  - Serve os recursos estáticos do frontend
  - Fornece os endpoints da API
 
## Banco de Dados

### PostgreSQL

Este projeto utiliza PostgreSQL como banco de dados principal.

#### Requisitos
- PostgreSQL 14 ou superior
- Usuário e banco de dados configurados

#### Configuração
1. Instale o PostgreSQL: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Crie um banco de dados para a aplicação
3. Crie um schema chamado api
4. Configure as credenciais no arquivo application.yml
### Proxy

Durante o desenvolvimento, as requisições do frontend para o backend são redirecionadas através de um proxy configurado em `proxy.conf.json`. Isso permite que o frontend seja executado em um servidor de desenvolvimento separado, mas ainda comunique-se com o backend sem problemas de CORS.

### Observações

- Certifique-se de que todas as variáveis de ambiente necessárias estejam configuradas corretamente.
- Talvez a porta do Frontend possa ser outra caso a padrão esteja em uso
