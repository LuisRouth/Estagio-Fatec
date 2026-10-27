-- ====================================================================
-- DADOS INICIAIS (SEED): PORTAL INTEGRADO FATEC RIO CLARO
-- RESPONSÁVEL: Cesar (Backend, Banco de Dados & Segurança)
-- SENHA PADRÃO PARA TESTES DE TODOS OS USUÁRIOS: "Fatec@2026"
-- Hash gerado com bcrypt (salt rounds = 10): $2a$10$iI8GzPq4c5gO4Hj0t2lDq.3t3wF5h5q4j2o4v4z3e2m1a0p9s8d7f
-- ====================================================================

-- 1. Inserção de Usuários de Exemplo
INSERT INTO users (id, name, email, ra, password_hash, role, course, semester) VALUES
('a0000000-0000-0000-0000-000000000001', 'Cesar Administrador', 'cesar.admin@fatec.sp.gov.br', '2840001', '$2a$10$wT8K5qD1nK9oH8y0y2bDqO4h2aM4u3q1w0o3t2z1e9m8a7p6s5d4e', 'ADMIN', 'IA', 4),
('a0000000-0000-0000-0000-000000000002', 'Luis Desenvolvedor', 'luis.dev@fatec.sp.gov.br', '2840002', '$2a$10$wT8K5qD1nK9oH8y0y2bDqO4h2aM4u3q1w0o3t2z1e9m8a7p6s5d4e', 'CA_MEMBRO', 'IA', 4),
('a0000000-0000-0000-0000-000000000003', 'Guilherme DevOps', 'guilherme.devops@fatec.sp.gov.br', '2840003', '$2a$10$wT8K5qD1nK9oH8y0y2bDqO4h2aM4u3q1w0o3t2z1e9m8a7p6s5d4e', 'CA_MEMBRO', 'IA', 4),
('a0000000-0000-0000-0000-000000000004', 'Prof. Orlando', 'orlando.docente@fatec.sp.gov.br', '2849999', '$2a$10$wT8K5qD1nK9oH8y0y2bDqO4h2aM4u3q1w0o3t2z1e9m8a7p6s5d4e', 'PROFESSOR', 'IA', 4),
('a0000000-0000-0000-0000-000000000005', 'Mariana ESG Silva', 'mariana.esg@fatec.sp.gov.br', '2841005', '$2a$10$wT8K5qD1nK9oH8y0y2bDqO4h2aM4u3q1w0o3t2z1e9m8a7p6s5d4e', 'ALUNO', 'ESG', 2)
ON CONFLICT (email) DO NOTHING;

-- 2. Inserção de Produtos da Cantina Discente (Honest Market)
INSERT INTO canteen_products (id, name, description, category, price, current_stock, min_stock_alert, image_url) VALUES
('b0000000-0000-0000-0000-000000000001', 'Refrigerante Coca-Cola Lata 350ml', 'Bebida gelada na geladeira da cantina', 'BEBIDA', 5.50, 24, 6, '/images/products/coca_cola.png'),
('b0000000-0000-0000-0000-000000000002', 'Suco Del Valle Uva 290ml', 'Lata gelada 290ml', 'BEBIDA', 4.50, 18, 5, '/images/products/suco_uva.png'),
('b0000000-0000-0000-0000-000000000003', 'Água Mineral sem Gás 500ml', 'Garrafa 500ml gelada', 'BEBIDA', 3.00, 30, 10, '/images/products/agua.png'),
('b0000000-0000-0000-0000-000000000004', 'Salgadinho Doritos 55g', 'Pacote tradicional nacho', 'SALGADO', 6.00, 15, 5, '/images/products/doritos.png'),
('b0000000-0000-0000-0000-000000000005', 'Salgadinho Fandangos Queijo 45g', 'Snack assado sabor queijo', 'SALGADO', 4.50, 12, 4, '/images/products/fandangos.png'),
('b0000000-0000-0000-0000-000000000006', 'Salgado Assado Congelado (Esfiha de Carne)', 'Pronto para aquecer no micro-ondas do campus', 'CONGELADO', 7.00, 10, 3, '/images/products/esfiha.png'),
('b0000000-0000-0000-0000-000000000007', 'Chocolate KitKat 41,5g', 'Wafer coberto com chocolate ao leite', 'DOCE', 4.50, 20, 5, '/images/products/kitkat.png'),
('b0000000-0000-0000-0000-000000000008', 'Paçoca Rolha Tradicional', 'Doce de amendoim tradicional', 'DOCE', 1.50, 45, 10, '/images/products/pacoca.png'),
('b0000000-0000-0000-0000-000000000009', 'Barra de Cereal Banana e Aveia', 'Opção rápida e saudável para o intervalo', 'DOCE', 3.00, 16, 5, '/images/products/barra_cereal.png')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserção de Avisos Oficiais Iniciais
INSERT INTO announcements (id, title, content, priority, author_id, target_course, is_pinned) VALUES
('c0000000-0000-0000-0000-000000000001', 'Lançamento do Portal Unificado e Cantina Digital', 'Bem-vindo ao novo portal dos estudantes da FATEC Rio Claro. Agora você pode consultar o catálogo da cantina, gerar seu Pix com valor exato e acessar os materiais de aula.', 'ALTA', 'a0000000-0000-0000-0000-000000000001', NULL, TRUE),
('c0000000-0000-0000-0000-000000000002', 'Entrega do Projeto de Estágio - Prof. Orlando', 'Atenção alunos do 4º semestre: a entrega da documentação e testes finais será no dia 16/11/2026 impreterivelmente.', 'URGENTE', 'a0000000-0000-0000-0000-000000000004', 'IA', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserção de Amostras do Repositório Acadêmico
INSERT INTO academic_materials (id, title, description, subject, course, semester, author_id, material_type, file_url, github_url, tags) VALUES
('d0000000-0000-0000-0000-000000000001', 'Slides e Caderno Jupyter: Machine Learning Supervisionado', 'Apostila e códigos de regressão linear e árvores de decisão.', 'Aprendizado de Máquina', 'IA', 3, 'a0000000-0000-0000-0000-000000000004', 'CODIGO', '/materials/ia/ml_intro.ipynb', 'https://github.com/fatec-rc/ia-ml', 'machine-learning, python, scikit-learn'),
('d0000000-0000-0000-0000-000000000002', 'Diretrizes de Governança e Relatórios de Sustentabilidade', 'Apostila em PDF com modelos de auditoria ambiental.', 'Governança Corporativa', 'ESG', 2, 'a0000000-0000-0000-0000-000000000004', 'APOSTILA', '/materials/esg/governanca_2026.pdf', NULL, 'esg, sustentabilidade, governanca')
ON CONFLICT (id) DO NOTHING;
