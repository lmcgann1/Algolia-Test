import axios from 'axios';

const apiKey = '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';

const apiUrl = 'https://api.openai.com/v1/completions';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
};

export const generateDescription = async (recipeName, recipeIngredients) => {
  try {
    const requestData = {
      model: 'text-davinci-003', // Depreciated model as of Jan 4, 2024
      prompt: `Please provide a 3 sentence description of a dish called '${recipeName}' The description should not contradict the ingredients: ${recipeIngredients}, but should not list the ingredients.`,
      max_tokens: 200,
    };

    const response = await axios.post(apiUrl, requestData, { headers });
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error generating description:', error);
    throw error;
  }
};
