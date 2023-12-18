import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, RefinementList, Pagination} from 'react-instantsearch';
import React, { useState, useEffect } from 'react';
import { generateDescription } from './api.js';
import './App.css';

const searchClient = algoliasearch('WA6MQG7XI2', '8dfd72cab9a5d5bbe956cae18ba9bc7d');

const CustomRefinementList1 = ({ attribute, header, ...rest }) => (
  <div>
    <header>{'Ratings:'}</header>
    <RefinementList
      attribute={attribute}
      transformItems={(items) =>
        items
          .map((item) => ({
            ...item,
            label: `${parseFloat(item.label).toFixed(1)}   - `,
          }))
          .sort((a, b) => parseFloat(b.label) - parseFloat(a.label))
      }
      {...rest}
    />
  </div>
);

const CustomRefinementList2 = ({ attribute, header, ...rest }) => (
  <div>
    <header>{"Prep Time:"}</header>
    <RefinementList
      attribute={attribute}
      transformItems={(items) =>
        items
          .map((item) => ({
            ...item,
            label: `${parseFloat(item.label).toFixed(0)} minutes   - `, // Add two spaces after the label
          }))
          .sort((a, b) => parseFloat(a.label) - parseFloat(b.label))
      }
      {...rest}
    />
  </div>
);



function Hit({ hit, onSelect }) {
  return (
    <article>
      <h1>
        <Highlight attribute="recipe_name" hit={hit} /> (⭐{hit.rating})
      </h1>
      <p>Recipe Category: <Highlight attribute="cuisine_path" hit={hit} /></p>
      <img src={hit.img_src} width={300} height={250} alt="" />
      <p>Prep time: {hit.prep_time} </p>
      <p>Total time: {hit.total_time} </p>
      <button onClick={() => onSelect(hit)}>View Details</button>
    </article>
  );
}

function SingleResult({ hit, onClear }) {
  const [generatedDescription, setGeneratedDescription] = useState('');

  const ingredientsArray = hit.ingredients.split(',').map((ingredient) => ingredient.trim());
  const nutritionArray = hit.nutrition.split(',').map((nutrition) => nutrition.trim());
  const instructionsArray = hit.directions.split('.').map((instruction) => instruction.trim()).filter(Boolean);

  useEffect(() => {
    if (hit && hit.recipe_name && generatedDescription === '') {

      const fetchDescription = async () => {
        try {
          const description = await generateDescription();
          setGeneratedDescription(description);
        } catch (error) {
          console.error('ChatGPT API Error:', error);
          setGeneratedDescription('Failed to generate description');
        }
      };

      fetchDescription();
    }
  }, [hit, generatedDescription]);

  return (
    <div style={{ margin: '0 20px' }}>
      <button onClick={onClear} style={{ margin: '20px auto', display: 'block' }}>
        Go Back
      </button>
      <article>
        <h1>
          <Highlight attribute="recipe_name" hit={hit} /> (⭐{hit.rating})
        </h1>
        <p>Recipe Category: <Highlight attribute="cuisine_path" hit={hit} /></p>
        <img src={hit.img_src} width={300} height={250} alt="" />
        <p>Prep Time: {hit.prep_time} </p>
        <p>Cook Time: {hit.cook_time} </p>
        <p>Total Time: {hit.total_time} </p>
        <p>AI Generative Text Description: {generatedDescription}</p>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <p>Ingredients:</p>
            <ul>
              {ingredientsArray.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <p>Nutrition:</p>
            <ul>
              {nutritionArray.map((nutrition, index) => (
                <li key={index}>{nutrition}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>Instructions:</p>
        <ol>
          {instructionsArray.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </article>
    </div>
  );
}

function App() {
  const [selectedHit, setSelectedHit] = useState(null);

  const handleSelect = (hit) => {
    setSelectedHit(hit);
  };

  const handleClear = () => {
    setSelectedHit(null);
  };

  const handleSearchStateChange = (searchState, query) => {
    if (query !== undefined && query !== '') {
      setSelectedHit(null);
    }
  };

  return (
      <InstantSearch
        searchClient={searchClient}
        indexName="Lorcan_Test_Deduplicated"
        onSearchStateChange={({ query }) => handleSearchStateChange(query)}
      >
        {!selectedHit && (
          <div>
            <SearchBox />
            <CustomRefinementList1 attribute="rating" header="Ratings" />
            <CustomRefinementList2 attribute="prep_time" header="Prep Time" />
          </div>
        )}
        <div style={{ marginLeft: '240px', padding: '20px' }}>
          {!selectedHit ? (
            <div>
              <Hits hitComponent={(props) => <Hit {...props} onSelect={handleSelect} />} />
              <div className="pagination-container">
                <Pagination />
              </div>
            </div>
          ) : (
            <SingleResult hit={selectedHit} onClear={handleClear} />
          )}
        </div>
      </InstantSearch>
  );
}
export default App;
