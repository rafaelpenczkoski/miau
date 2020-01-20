# POST /login
## Login com email e password e retornar um token de acesso

# GET /me
## Rota para autenticar o token de acesso retornando os dados do usuário

# GET /user:/:user_id
## Buscar os dados de um usuário em especifico

# GET /users
## Buscar a lista de usuários

# POST /user
## Adicionar um novo usuário

# PATCH /user/:user_id
## Edita um usuário (somente o user proprietário pode alterar)
## não é possível alterar o email

# DELETE /user/:user_id
## Remove um usuário (somente o user proprietário pode deletar)

# POST /forgot_password
## rota para recuperação de senha, um email será enviado com token para redefinir a senha

# POST /reset_password
## rota para redefinição da senha fornecendo o token enviado para o email

# POST /travels
## Cria uma nova viagem

# PATCH /travels/:id
## atualiza uma viagem (somente o user proprietário pode alterar)

# GET /travels
## lista as viagens

# GET /travels:id
## exibe os detalhes de uma viagem

# DELETE /travels/:id
## deleta uma viagem (somente o user proprietário pode deletar)