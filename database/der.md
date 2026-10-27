# DIAGRAMA ENTIDADE-RELACIONAMENTO (DER) E DICIONÁRIO DE DADOS
**Projeto:** Portal Integrado FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Prof. Orlando)  
**Engenheiro Responsável:** Cesar (Backend, Banco de Dados & Segurança)  
**Status:** Sprint 1 Concluída  

---

## 1. Visão Geral da Modelagem

O modelo de dados foi concebido em PostgreSQL para garantir conformidade **ACID**, velocidade nas transações da cantina discente (*Honest Market*), auditoria integral de acessos e suporte nativo a indexação para buscas no repositório acadêmico.

### Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ CANTEEN_TRANSACTIONS : "realiza"
    USERS ||--o{ CANTEEN_SUGGESTIONS : "submete"
    USERS ||--o{ ACADEMIC_MATERIALS : "publica"
    USERS ||--o{ ANNOUNCEMENTS : "emite"
    USERS ||--o{ AUDIT_LOGS : "gera"
    
    CANTEEN_TRANSACTIONS ||--|{ CANTEEN_TRANSACTION_ITEMS : "contém"
    CANTEEN_PRODUCTS ||--o{ CANTEEN_TRANSACTION_ITEMS : "composto_por"

    USERS {
        uuid id PK
        string name
        string email UK
        string ra UK
        string password_hash
        enum role "ALUNO, CA_MEMBRO, PROFESSOR, ADMIN"
        enum course "IA, ESG"
        int semester "1 a 6"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CANTEEN_PRODUCTS {
        uuid id PK
        string name
        text description
        enum category "DOCE, SALGADO, BEBIDA, CONGELADO, OUTRO"
        decimal price
        int current_stock
        int min_stock_alert
        string image_url
        boolean is_available
        timestamp updated_at
    }

    CANTEEN_TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        enum status "PENDENTE, PAGO, CANCELADO, EM_ANALISE"
        string payment_method "PIX"
        text pix_copy_paste
        string pix_qr_code_url
        string proof_image_url
        uuid validated_by FK
        timestamp created_at
    }

    CANTEEN_TRANSACTION_ITEMS {
        uuid id PK
        uuid transaction_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    ACADEMIC_MATERIALS {
        uuid id PK
        string title
        text description
        string subject
        enum course "IA, ESG"
        int semester
        uuid author_id FK
        string material_type "SLIDE, APOSTILA, CODIGO, TCC"
        string file_url
        string github_url
        int download_count
        timestamp created_at
    }

    ANNOUNCEMENTS {
        uuid id PK
        string title
        text content
        enum priority "BAIXA, MEDIA, ALTA, URGENTE"
        uuid author_id FK
        enum target_course "IA, ESG, NULL(Todos)"
        boolean is_pinned
        timestamp expires_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_name
        string entity_id
        string ip_address
        jsonb payload
        timestamp created_at
    }
```

---

## 2. Dicionário de Dados e Regras de Integridade

### A. Tabela `users`
* `id` (UUID): Identificador único imutável gerado por `gen_random_uuid()`.
* `password_hash` (VARCHAR): Hash gerado via **bcrypt** com 10 a 12 salt rounds. Nenhuma senha trafega ou é salva em texto plano.
* `role` (ENUM): Define o controle de acesso baseado em funções (RBAC). Permissões:
  * `ALUNO`: Consulta catálogo, realiza compras, acessa repositório, baixa materiais.
  * `CA_MEMBRO`: Gestão de estoque da cantina, conferência de comprovantes Pix, emissão de avisos discentes.
  * `PROFESSOR`: Curadoria de materiais, envio de notas de aula e avisos acadêmicos.
  * `ADMIN`: Acesso irrestrito e visualização de auditoria.

### B. Módulo Cantina (`canteen_products`, `canteen_transactions`, `canteen_transaction_items`)
* **Integridade de Estoque:** `current_stock` possui restrição `CHECK (current_stock >= 0)`.
* **Rastreabilidade de Compras:** Ao realizar um pedido no Honest Market, cria-se uma transação `PENDENTE` vinculada ao usuário autenticado com chave Pix dinâmica contendo o valor exato. Quando o pagamento é validado (via IA OCR ou CA), o status é alterado para `PAGO`.

### C. Segurança & Auditoria (`audit_logs`)
* Todas as operações sensíveis (login, alteração de privilégios, baixa de estoque manual e aprovação de transação) registram um evento em `audit_logs` contendo IP, Agente do Usuário e Payload das modificações.
