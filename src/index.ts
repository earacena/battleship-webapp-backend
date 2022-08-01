import fastify from 'fastify';

const server = fastify({
  logger: true,
});

server.get('/', async () => 'Hello');

server.listen({ port: 8080 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
