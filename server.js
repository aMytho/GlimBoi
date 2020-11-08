/*
const { request, gql, GraphQLClient } = require('graphql-request') 
async function main() {
  const endpoint = 'https://glimesh.tv/api'
  const query = gql`{
      query {
        myself {
            id}
          }
      }`
  const graphQLClient = new GraphQLClient(endpoint, {
    Headers: {
      'Authorization': 'Bearer 294b44c4f16321c53f62b2bbe58779ea359d1e122d7161d5d3705f223c4ec339',
    },
  })
  const data = await graphQLClient.request(query)
  console.log(JSON.stringify(data, undefined, 2))   
}
main().catch((error) => console.error(error))

var request = require('request');
*/
//test
const io = require("socket.io-client");
var data = ` 
query{
  channel(id:6) {
    category {
      slug,
      name,
      id,
      tagName,
      parent {id,name}
    },
    chatMessages {
      user {displayname},
      id,insertedAt,message
    }
  }
}
    `

var options = {
    method: 'POST',
    body: data,
    url: 'https://glimesh.tv/api',
    headers: {
        'Authorization': 'Bearer 294b44c4f16321c53f62b2bbe58779ea359d1e122d7161d5d3705f223c4ec339'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body); //The unfiltered response
        var convertedResponse = JSON.parse(body); //Convert the response
        //console.log(`You are ${convertedResponse.data.myself.username} and your ID is ${convertedResponse.data.myself.id}`);
    } else {
        console.log(error) //log any errors
        console.log(body)
    }
}
//call the request

//request(options, callback);
var url = 'https://glimesh.tv/api/socket?token=294b44c4f16321c53f62b2bbe58779ea359d1e122d7161d5d3705f223c4ec339'

const socket = io("https://glimesh.tv/api/socket?token=294b44c4f16321c53f62b2bbe58779ea359d1e122d7161d5d3705f223c4ec339", {
  reconnectionDelayMax: 10000,
});

socket.on("connection" , (socket) => {
  console.log('connected')
})/*
io.on('connection', (socket) => {
  console.log('aaaaaaa')
})
*/
