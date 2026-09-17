# StockSys

StockSys é uma aplicação fullstack para gerenciamento de **produtos, estoque e pedidos**, desenvolvida como teste técnico para uma vaga de Desenvolvedor Fullstack Pleno.

A solução prioriza consistência transacional, regras de negócio no backend, concorrência de estoque, idempotência na criação de pedidos e uma interface administrativa simples e responsiva.

## Funcionalidades

### Produtos

- Cadastro, consulta e edição de produtos.
- Ativação e inativação sem exclusão física.
- Listagem paginada.
- Busca por nome.
- Filtro por status.
- Ordenação por campos permitidos.
- Controle de estoque com proteção contra valores negativos.

### Pedidos

- Criação de pedidos com um ou mais produtos.
- Apenas produtos ativos podem ser adicionados.
- Quantidade solicitada não pode ultrapassar o estoque disponível.
- Nome e preço do produto são armazenados como **snapshot** no item do pedido.
- Desconto percentual entre **0% e 20%**.
- Subtotal, desconto e total são calculados no backend.
- Redução de estoque e criação do pedido ocorrem na mesma transação.
- Cancelamento restaura o estoque exatamente uma vez.
- Ciclo de vida controlado:
  - `Pending -> Processing`
  - `Pending -> Cancelled`
  - `Processing -> Completed`
  - `Processing -> Cancelled`
  - `Completed` e `Cancelled` são estados finais.
- Criação protegida por `Idempotency-Key`.
- Concorrência otimista com `rowversion` para impedir consumo simultâneo da última unidade.

### Frontend

- Dashboard operacional.
- Gestão completa de produtos.
- Criação e consulta de pedidos.
- Filtros, paginação e ordenação.
- Loading, empty states, retry e mensagens de erro.
- Confirmações para ações destrutivas.
- Toasts de sucesso.
- Layout responsivo.

---

## Tecnologias

### Backend

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core 10
- SQL Server 2022
- MediatR
- FluentValidation
- Swagger / OpenAPI

### Frontend

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS 4
- Lucide React
- Fetch API

### Testes e infraestrutura

- xUnit
- Testcontainers for .NET
- SQL Server real nos testes de integração
- Docker / Docker Compose

---

## Estrutura do projeto

```text
StockSys/
├── Backend/
│   ├── API/
│   ├── Application/
│   ├── Domain/
│   └── Infrastructure/
├── Frontend/
├── Tests/
│   └── StockSys.Tests/
├── .config/
│   └── dotnet-tools.json
├── Dockerfile
├── docker-compose.yml
├── StockSys.sln
└── README.md
```

### Responsabilidades

- **API**: controllers, configuração HTTP, CORS, Swagger e tratamento global de exceções com `IExceptionHandler`.
- **Application**: commands, queries, handlers, validators e DTOs de resposta.
- **Domain**: entidades, enum de status e regras de domínio.
- **Infrastructure**: EF Core, SQL Server, migrations e repositórios.
- **Frontend**: interface Next.js e integração com a API.
- **Tests**: testes unitários e testes de integração com SQL Server real.

---

# Como executar

## Opção recomendada — Docker Compose

A forma mais simples de executar o StockSys é subir **SQL Server, API e frontend juntos** com Docker Compose.

### Pré-requisito

- Docker Desktop ou outro runtime compatível com Docker Compose.

### 1. Clone o repositório

```bash
git clone https://github.com/Gustavo-Arimateia/StockSys.git
cd StockSys
```

### 2. Configure a senha do SQL Server

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

O arquivo `.env` é local e não deve ser versionado.

Exemplo:

```env
SQLSERVER_SA_PASSWORD=ChangeMe!123456
```

### 3. Suba a aplicação completa

```bash
docker compose up --build -d
```

O Compose sobe três serviços:

| Serviço | Endereço |
| --- | --- |
| Frontend | `http://localhost:3001` |
| API | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger` |
| SQL Server | `localhost:1433` |

As migrations são aplicadas automaticamente pela API durante a inicialização no ambiente Docker.

O frontend recebe `NEXT_PUBLIC_API_URL=http://localhost:8080` durante o build da imagem, portanto **não é necessário criar `Frontend/.env.local` para executar via Docker Compose**.

### 4. Verifique os containers

```bash
docker compose ps
```

O esperado é encontrar os serviços:

```text
stocksys-sqlserver
stocksys-api
stocksys-frontend
```

### Logs

Todos os serviços:

```bash
docker compose logs -f
```

Somente a API:

```bash
docker compose logs -f api
```

Somente o frontend:

```bash
docker compose logs -f frontend
```

### Encerrar

```bash
docker compose down
```

Para remover também o volume do SQL Server e recriar o banco do zero na próxima execução:

```bash
docker compose down -v
```

### Rebuild após alterações

```bash
docker compose up --build -d
```

---

# Execução manual para desenvolvimento

A execução manual é opcional. Ela é útil quando backend e frontend estão sendo alterados durante o desenvolvimento.

## Backend

Pré-requisitos:

- .NET SDK 10;
- SQL Server acessível localmente ou pelo container do projeto.

Caso queira subir somente o banco via Docker:

```bash
docker compose up -d sqlserver
```

Depois configure a connection string e execute a API.

Exemplo no PowerShell:

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=StockSysDb;User Id=sa;Password=SUA_SENHA;TrustServerCertificate=True;"
$env:Database__ApplyMigrationsOnStartup="true"
dotnet run --project Backend/API/API.csproj --launch-profile http
```

A API ficará disponível em:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger
```

## Frontend

Pré-requisitos:

- Node.js 20.9 ou superior;
- npm;
- API disponível em `http://localhost:8080`.

Entre na pasta:

```bash
cd Frontend
npm ci
```

Copie o arquivo local de ambiente:

```bash
cp .env.example .env.local
```

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Valor padrão:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Execute:

```bash
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:3001
```

A API está configurada para aceitar essa origem via CORS.

## Migrations manualmente

O projeto possui um manifest local do `dotnet-ef`.

```bash
dotnet tool restore
```

Depois, com a connection string configurada:

```bash
dotnet ef database update \
  --project Backend/Infrastructure/Infrastructure.csproj \
  --startup-project Backend/API/API.csproj
```

No PowerShell:

```powershell
dotnet ef database update --project Backend/Infrastructure/Infrastructure.csproj --startup-project Backend/API/API.csproj
```

As migrations versionadas estão em:

```text
Backend/Infrastructure/Persistence/Migrations
```

# API

## Produtos

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/products` | Cadastrar produto |
| `GET` | `/api/products/{id}` | Consultar produto |
| `GET` | `/api/products` | Listar, filtrar, paginar e ordenar |
| `PUT` | `/api/products/{id}` | Editar produto |
| `PATCH` | `/api/products/{id}/activate` | Ativar produto |
| `PATCH` | `/api/products/{id}/deactivate` | Inativar produto |

Exemplo de cadastro:

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "description": "Notebook para uso corporativo",
    "price": 4299.90,
    "stockQuantity": 10
  }'
```

Exemplo de listagem:

```text
GET /api/products?page=1&pageSize=10&name=notebook&isActive=true&sortBy=price&sortDirection=asc
```

## Pedidos

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/orders` | Criar pedido |
| `GET` | `/api/orders/{id}` | Consultar detalhes |
| `GET` | `/api/orders` | Listar, filtrar e paginar |
| `PATCH` | `/api/orders/{id}/status` | Alterar status |

### Criar pedido

A criação exige o header `Idempotency-Key` com um GUID.

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "discountPercentage": 10
  }'
```

O cliente **não envia** nome do produto, preço unitário, subtotal, valor do desconto ou total como fonte de verdade. Esses valores são obtidos/calculados no backend.

### Alterar status

```bash
curl -X PATCH http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": 2 }'
```

Valores do status:

| Valor | Status |
| ---: | --- |
| `1` | Pending |
| `2` | Processing |
| `3` | Completed |
| `4` | Cancelled |

---

# Regras de negócio e decisões técnicas

## Backend como fonte da verdade

Validações no frontend existem apenas para melhorar a experiência do usuário. Regras de estoque, preço, desconto, status e total são sempre revalidadas no backend.

## Snapshot dos itens

Ao criar um pedido, `ProductName` e `UnitPrice` são copiados para `OrderItem`.

Por isso, alterar posteriormente o nome ou o preço de um produto não modifica pedidos antigos.

## Transação e rollback

A criação de um pedido altera três partes relacionadas do estado:

1. o pedido;
2. os itens;
3. o estoque dos produtos.

A persistência ocorre em uma transação SQL. Se alguma gravação falhar, a transação é revertida e não existe pedido parcialmente criado nem estoque parcialmente baixado.

O cancelamento também persiste a mudança de status e a restauração do estoque na mesma transação.

## Concorrência de estoque

`Product` possui uma coluna SQL Server `rowversion` configurada como token de concorrência do EF Core.

Se duas operações lerem a última unidade ao mesmo tempo, somente a primeira atualização consegue persistir a versão esperada. A segunda recebe conflito de concorrência, a transação é revertida e a API retorna HTTP `409`.

Existe também uma check constraint no banco garantindo:

```text
StockQuantity >= 0
```

A constraint é uma defesa adicional e não substitui o controle de concorrência.

## Idempotência

`POST /api/orders` exige `Idempotency-Key`.

O backend armazena:

- a chave enviada pelo cliente;
- um hash SHA-256 do conteúdo lógico da requisição.

Comportamento:

- mesma chave + mesmo conteúdo: retorna o pedido já criado e não reduz estoque novamente;
- mesma chave + conteúdo diferente: HTTP `409`;
- corrida entre requisições com a mesma chave: índice único e tratamento da aplicação impedem duplicidade.

O frontend mantém a mesma chave enquanto o conteúdo do pedido não muda, o que permite retry seguro após timeout/falha de comunicação.

## Desconto

A solução adotou desconto percentual entre **0% e 20%**.

O frontend mostra uma estimativa, mas o valor oficial é calculado pelo domínio no backend com `decimal` e arredondamento para duas casas decimais.

## Produto sem exclusão física

Produtos não são removidos. Eles são ativados/inativados.

Isso mantém o histórico e evita que operações administrativas destruam referências usadas por pedidos antigos.

---

# Erros da API

As respostas de erro seguem um contrato consistente:

```json
{
  "message": "Produto não encontrado.",
  "code": "PRODUCT_NOT_FOUND",
  "errors": null
}
```

O tratamento global utiliza `IExceptionHandler`, registrado com `AddExceptionHandler<GlobalExceptionHandler>()` e executado pelo `UseExceptionHandler()`. O `AddProblemDetails()` fornece o fallback exigido pelo middleware quando nenhum handler tratar uma exceção, enquanto o `GlobalExceptionHandler` preserva o contrato `ApiErrorResponse` para as exceções da aplicação e para erros inesperados.

Principais status HTTP:

- `400` — entrada inválida / FluentValidation;
- `404` — recurso não encontrado;
- `409` — concorrência ou conflito de idempotência;
- `422` — regra de negócio não atendida;
- `500` — erro interno com mensagem genérica, sem expor detalhes da exceção.

Códigos relevantes incluem:

- `PRODUCT_NOT_FOUND`
- `PRODUCT_INACTIVE`
- `PRODUCT_OUT_OF_STOCK`
- `ORDER_NOT_FOUND`
- `INVALID_ORDER_STATUS_TRANSITION`
- `IDEMPOTENCY_KEY_REUSED`
- `CONCURRENCY_CONFLICT`

---

# Testes

A suíte contém testes de domínio, validators, `GlobalExceptionHandler` e integração.

Os testes de integração utilizam **Testcontainers + SQL Server real**, especialmente para os cenários em que EF Core InMemory não seria representativo:

- rollback transacional;
- concorrência de estoque;
- `rowversion` do pedido;
- restauração de estoque no cancelamento;
- idempotência.

Com Docker em execução:

```bash
dotnet test StockSys.sln
```

Para somente compilar o backend:

```bash
dotnet build StockSys.sln
```

## Validação do frontend

```bash
cd Frontend
npm ci
npm run check
```

`npm run check` executa:

```text
lint -> typecheck -> build
```

---

# Dashboard

O dashboard é um diferencial adicional e utiliza os endpoints já existentes para apresentar:

- produtos ativos e inativos;
- total de pedidos;
- pedidos pendentes;
- distribuição de pedidos por status;
- distribuição de produtos por status;
- pedidos recentes.

As contagens são obtidas através dos metadados `totalItems` das consultas paginadas, evitando carregar listas completas apenas para contabilização.

---

# Limitações conhecidas

- Não há autenticação/autorização, pois não faz parte do escopo do desafio.
- O dashboard agrega dados utilizando os endpoints existentes; em uma solução com maior volume seria preferível um endpoint de agregação dedicado.
- O frontend não possui testes automatizados de componentes/E2E; a validação atual utiliza TypeScript, ESLint, build e testes manuais dos fluxos.
- Não existe histórico/auditoria persistente das mudanças de status.

## Melhorias futuras

- CI com build, testes e lint em pull requests.
- Testes E2E do frontend.
- Endpoint dedicado de métricas do dashboard.
- Logs estruturados com correlation/trace id.
- Health checks completos para API e banco.
- Auditoria de alterações de status.
- Observabilidade e métricas.

---

# Checklist rápido antes da entrega

## Execução completa com Docker

```bash
docker compose down
docker compose up --build -d
docker compose ps
```

Acesse:

```text
Frontend: http://localhost:3001
Swagger:  http://localhost:8080/swagger
```

Valide manualmente:

1. cadastrar um produto;
2. editar e ativar/inativar;
3. criar um pedido;
4. conferir a redução do estoque;
5. reenviar a mesma operação idempotente;
6. processar e concluir um pedido;
7. cancelar outro pedido e conferir a restauração do estoque;
8. consultar pedidos antigos após alterar nome/preço do produto;
9. conferir listagens, filtros e paginação;
10. conferir o Dashboard.

## Qualidade do código

Backend:

```bash
dotnet restore StockSys.sln
dotnet build StockSys.sln
dotnet test StockSys.sln
```

Frontend:

```bash
cd Frontend
npm ci
npm run check
```

`npm run check` executa lint, typecheck e build de produção.
