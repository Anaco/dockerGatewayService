const {ApolloServer, gql} = require('apollo-server');
const {buildFederatedSchema} = require('@apollo/federation');
var AWS = require('aws-sdk');

var ddb = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
const typeDefs = gql`

    type Query{
        me: User
        you: User
        us: User
    }

    type User @key(fields: "id") {
        id: ID!
        username: String

    }

`;

const resolvers = {
    Query: {
        async me() {
            var params = {
                TableName: 'Zoo-Entitlement-Table',
                Key: {
                    "accountNumber": "141833-000001",
                    "entitlementTTL": "1236545"
                }
            };
            var result = await ddb.get(params).promise()
            return { id: JSON.stringify(result), username: "Dynamo"}
        },

        you() {
            return {id:"2", username:"Travis"}
        },

        us() {
            return {id:"3", username:"Joe"}
        }
    },
    User: {
        __resolveReference(user, {fetchUserById}){
            return fetchUserById(user.id)
        }
    }
};

const server = new ApolloServer({
    schema: buildFederatedSchema([{typeDefs,resolvers}])
});

server.listen(4001).then(({url}) => {
    console.log(`Server running at: ${url}`);
})