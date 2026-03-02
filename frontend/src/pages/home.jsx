import { useNavigate } from 'react-router-dom';
import './Pages_css/App.css'

function FrontPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className='home-container'>
                <h1>Travel Guide</h1>
                <h3>Discover the world with our travel guide</h3>
                <div className='buttons'>
                    <button onClick={() => navigate('/homePage')}>Get Started</button>
                    {/* Sign In also goes to login/signup page */}
                    <button onClick={() => navigate('/login')}>Sign In</button>
                </div>
            </div>
        </>
    )
}

export default FrontPage
