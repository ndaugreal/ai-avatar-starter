
// create a bufferToBase64 function
const bufferToBase64 = (buffer) => {
    let arr = new Uint8Array(buffer);
    const base64 = btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/png;base64,${base64}`;
};

const generateAction = async (req, res) => {
    console.log('Received request')

    // parse the request body to get the input
    const input = JSON.parse(req.body).input;

    // create a fetch request to HuggingFace API
    const response = await fetch(
        `https://api-inference.huggingface.co/models/augreal/sd-1-5-kahg`,
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                inputs: input,
            }),
        }
    );

    // console.log(response);
    // check for different response status to send proper payload
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        // convert the buffer to base64
        const base64 = bufferToBase64(buffer);
        // send the base64 image to the client
        res.status(200).json({ image: base64 })
    } else if (response.status === 503) {
        const json = await response.json();
        res.status(503).json(json);
    } else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }
};

export default generateAction