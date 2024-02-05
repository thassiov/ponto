# Controle de ponto 
Desafio Ília

![Testes unitarios e de integracao](https://github.com/thassio/ponto/actions/workflows/test.yaml/badge.svg)

### Dependencias

- docker@24

Nao e necessario instalar node ou qualquer outra ferramenta alem do Docker.

### Como executar o servidor

```
# estando na raiz do projeto, execute:
docker compose up
```

O container do servidor sera criado (Dockerfile) e a aplicacao sera iniciada. Localmente, um diretorio chamado `data` sera criado na raiz do projeto a fim de manter os dados do banco salvos. Esse projeto usa SQLite.

### Como parar o servidor

```
# O servidor ira parar, mas os dados serao persistidos no diretorio `data` local.
# Caso seja executado `docker compose up` novamente, os dados serao restaurados
Ctrl+c
```

### Endpoints

O container está configurado para funcionar na porta `8080` com bridge com o localhost. Os endpoints que podem ser acessados sao:

- http://0.0.0.0:8080/api-docs : Especificacao OpenAPI do projeto
- http://0.0.0.0:8080/v1 : Base URL de todas as chamadas para essa API

### Recurso

Nesse projeto foi adicionada uma colecao do Postman chamada `controle-de-ponto.postman_collection.json` que pode ser importada para facilidar no uso.

### Modificacoes

Esse controle de ponto tem suporte a multiplos usuarios (no caso um mecanismo simples onde cada ponto recebe um campo `idDeUsuario` para fazer a diferenciacao).
Caso esse `idDeUsuario` nao seja fornecido nos requests da api, o valor default é `1`.

### POST criar ponto

Para identificar o usuario, adicione a propriedade `idDeUsuario:<number>` ao json enviado.

Exemplo
```json
{
    "idDeUsuario": 1,
    "momento": "2018-08-22T16:00:00"
}
```

### GET gerar relatorio

Para identificar o usuario, adicione o parametro `idDeUsuario` via querystring na URL

Exemplo
```json
http://<....>/v1/folhas-de-ponto/2018-08?idDeUsuario=1
```
