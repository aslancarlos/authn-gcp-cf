const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Função para obter o ID token do endpoint de metadados
async function getIdToken(audience) {
  const response = await axios.get(
    `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`,
    {
      headers: { 'Metadata-Flavor': 'Google' }
    }
  );
  return response.data;  // Retorna o ID token
}

// Função para obter informações do projeto e da instância
async function getInstanceMetadata() {
  const projectIdResponse = await axios.get(
    'http://metadata.google.internal/computeMetadata/v1/project/project-id',
    { headers: { 'Metadata-Flavor': 'Google' } }
  );


  return {
    projectId: projectIdResponse.data
  };
}

// Função HTTP principal da Cloud Function
functions.http('helloHttp', async (req, res) => {
  try {
    const audience = 'https://your-target-service-url';
    const originalIdToken = await getIdToken(audience);  // Obtenha o ID token original
    const metadata = await getInstanceMetadata();  // Obtenha metadados do projeto e da instância

    // Decodifique o token original para reutilizar as informações
    const decodedToken = jwt.decode(originalIdToken);

    // Adicione os claims personalizados ao token
    const customClaims = {
      ...decodedToken,
      'project-id': metadata.projectId,
      'instance-name': "teste-01"
    };

    // Crie um novo token com as claims adicionais
    const secret = 'your-256-bit-secret'; // Use uma chave secreta segura para assiná-lo
    const newToken = jwt.sign(customClaims, secret, { algorithm: 'HS256' });

    res.send(`JWT token personalizado: ${newToken}`);
  } catch (error) {
    console.error('Erro ao gerar o token JWT personalizado:', error);
    res.status(500).send('Falha ao gerar o token JWT personalizado');
  }
});
