import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

// create an input state

const Home = () => {

  const maxRetries = 20;
  // create an input state
  const [input, setInput] = useState('');
  // create an img state
  const [img, setImg] = useState('');
  // create a retry state
  // the value of this state will be the estimated time to wait before retrying
  const [retry, setRetry] = useState(0);
  // create a retyrCount state
  const [retryCount, setRetryCount] = useState(maxRetries);
  // create a isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);
  // create a finalPrompt state
  const [finalPrompt, setFinalPrompt] = useState('');

  // define a function to update the input state
  const onChange = (e) => { setInput(e.target.value) };

  // define a generateAction function
  const generateAction = async () => {
    console.log('Generating...');

    // Add this check to make sure we don't send multiple requests at the same time
    if (isGenerating && retry === 0) return;

    // set isGenerating to true
    setIsGenerating(true);

    // if this is a retry, decrement the retryCount if it's not 0 else return 0
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }



    const finalInput = input.replace(/kahu/gi, 'kahurangio');

    // call the API
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ finalInput }),
    });

    // get the response
    const data = await response.json();

    // if response returns code 503, log model is still loading
    if (response.status === 503) {
      console.log('Model is still loading');
      setRetry(data.estimated_time);
      return;
    }

    // if response returns not 200, log error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      return;
    }

    // set finalPrompt to the input
    setFinalPrompt(input);
    // reset input to empty string
    setInput('');
    // set img state to the response
    setImg(data.image);
    // set isGenerating to false
    setIsGenerating(false);

  };


  // define a sleep function
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };




  // call useEffect 
  useEffect(() => {
    const runRetry = async () => {
      // if retryCount is 0, we stop retrying
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes`);
        setRetryCount(maxRetries);
        return;
      }

      // if retryCount is not 0, we retry
      console.log(`Retrying in ${retry} seconds...`);

      await sleep(retry * 1000);
      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);



  return (
    <div className="root">
      <Head>
        <title>Magic Photo Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Magic Photo Generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Turn me into anyone you want!</h2>
          </div>
          <div className="prompt-container">
            <input className='prompt-box' value={input} onChange={onChange} />
            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? 'generate-button loading' : 'generate-button'
                }
                onClick={generateAction}
              >
                <div className='generate'>
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt="input" />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
        </a>
      </div>
    </div>
  );
};

export default Home;
