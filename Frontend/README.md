# StockSys Frontend

Frontend do **StockSys**, aplicação de gestão de produtos, estoque e pedidos desenvolvida em **Next.js 16**, **React 18**, **TypeScript** e **Tailwind CSS**.

O frontend consome a API ASP.NET Core do projeto e cobre o fluxo completo do desafio: cadastro e manutenção de produtos, criação idempotente de pedidos, acompanhamento do ciclo de vida dos pedidos e dashboard operacional.

## Funcionalidades

- Dashboard com indicadores de produtos e pedidos.
- Listagem de produtos com busca, filtros, ordenação e paginação.
- Cadastro e edição de produtos.
- Ativação e inativação de produtos com confirmação.
- Criação de pedidos somente com produtos ativos.
- Controle visual de quantidade conforme estoque disponível.
- Desconto de 0% a 20%, com cálculo apenas para apresentação; os valores oficiais são calculados no backend.
- `Idempotency-Key` na criação de pedidos para evitar duplicidade em reenvios.
- Listagem de pedidos com filtros por status e período.
- Detalhes do pedido preservando snapshots de nome e preço dos produtos.
- Transições de status compatíveis com as regras do domínio.
- Cancelamento com confirmação e restauração de estoque realizada pelo backend.
- Estados de loading, erro, retry, empty state e feedback por toast.
- Layout responsivo com navegação lateral.

## Tecnologias

- Next.js 16 (Pages Router)
- React 18
- TypeScript
- Tailwind CSS 4
- Lucide React
- Fetch API

Não foram adicionados gerenciadores de estado ou bibliotecas de formulário porque o escopo atual é atendido com estado local e componentes reutilizáveis.

## Estrutura

```text
src/
├── components/
│   ├── dashboard/
│   ├── layout/
│   ├── orders/
│   ├── products/
│   └── ui/
├── lib/
│   ├── api/
│   └── formatters.ts
├── pages/
│   ├── dashboard/
│   ├── orders/
│   └── products/
├── styles/
└── types/
```

### Responsabilidades

- `components`: componentes visuais reutilizáveis e componentes específicos de cada módulo.
- `lib/api`: cliente HTTP e módulos de acesso à API.
- `pages`: composição das telas e controle do fluxo de navegação.
- `types`: contratos usados pelo frontend.
- `styles`: tokens globais da identidade visual e configuração do Tailwind.

## Pré-requisitos

- Node.js 20 ou superior.
- API StockSys disponível localmente.

## Configuração

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Valor padrão:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

O frontend utiliza a porta **3001** porque a porta 3000 está reservada no ambiente local do projeto.

A API deve permitir CORS para:

```text
http://localhost:3001
```

## Instalação

```bash
npm ci
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3001
```

A rota raiz redireciona para `/dashboard`.

## Validação antes da entrega

```bash
npm run lint
npm run typecheck
npm run build
```

Ou execute tudo em sequência:

```bash
npm run check
```

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/dashboard` | Resumo operacional |
| `/products` | Listagem e gestão de produtos |
| `/products/new` | Cadastro de produto |
| `/products/[id]/edit` | Edição de produto |
| `/orders` | Listagem de pedidos |
| `/orders/new` | Criação de pedido |
| `/orders/[id]` | Detalhes e ciclo de vida do pedido |

## Decisões importantes

### API como fonte da verdade

O frontend realiza validações de experiência do usuário, mas regras de negócio continuam no backend. Estoque, preços do pedido, desconto final, transições de status, concorrência e restauração de estoque não dependem da interface para serem garantidos.

### Idempotência

Na criação de um pedido é gerada uma chave com `crypto.randomUUID()`. A mesma chave é mantida enquanto o payload do pedido não muda, permitindo repetir uma requisição após uma falha de comunicação sem criar outro pedido. Se produto, quantidade ou desconto forem alterados, a chave é invalidada e uma nova operação passa a ser considerada.

### Snapshots do pedido

A tela de detalhes utiliza `productName` e `unitPrice` retornados pelo próprio item do pedido. Ela não consulta os valores atuais do produto, preservando a representação histórica do pedido.

### Dashboard

O dashboard utiliza os endpoints já existentes e consulta apenas os dados necessários. As contagens são obtidas pelo `totalItems` das consultas paginadas, evitando carregar listas completas somente para contabilização.

## Variáveis de ambiente e arquivos locais

`.env.local`, `node_modules`, `.next` e arquivos incrementais do TypeScript não devem ser versionados. O repositório mantém apenas `.env.example` como referência de configuração.
