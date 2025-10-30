import {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {action, userId, data} = req.body;

        if (!userId) {
            return res.status(400).json({message: 'User ID is required'});
        }

        try {
            let response;
            switch (action) {
                case 'updatePhone':
                    response = await fetch(`YOUR_API_ENDPOINT/users/${userId}/phone`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({phone: data.phone}),
                    });
                    break;
                // Add cases for 'addAddress' and 'deleteAddress' similarly
                default:
                    return res.status(400).json({message: 'Invalid action'});
            }
            const result = await response.json();
            return res.status(response.status).json(result);
        } catch (error: any) {
            return res.status(500).json({message: error.message});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
