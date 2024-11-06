const functions = require('@google-cloud/functions-framework');
const axios = require('axios');

// Função para obter o ID token
async function getIdToken() {
  // Defina o público-alvo (audience) para o qual o token será usado
  const audience = 'conjur/conjur/host/data/myspace/gcp-apps/test-app';
  
  try {
    const response = await axios.get(
      `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`,
      {
        headers: { 'Metadata-Flavor': 'Google' }
      }
    );
    return response.data;  // ID token retornado
  } catch (error) {
    console.error('Erro ao obter o ID token:', error);
    throw error;
  }
}

// Defina a função HTTP para acessar o token
functions.http('helloHttp', async (req, res) => {
  try {
    const token = await getIdToken();  // Chama a função para obter o token
    res.send(`JWT token recuperado: ${token}`);
  } catch (error) {
    res.status(500).send('Falha ao recuperar o token JWT');
  }
});
