import React, {useState, useEffect} from 'react';
import { Container, Row, Col, Input, FormGroup, Form, Button,Navbar} from 'reactstrap';
import axios from "axios";
import Loader from 'react-loader-spinner';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import Sentiment from './images/sentiments.png'
import TextScroller from './components/TextScroller'
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';

function App() {
  const [statDetails, setStatDetails] = useState({total: '', death:'', recovered: ''})
  const [trendingData, setTrendingData] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sentimentResponse, setSentimentResponse] = useState([])
  const [loader, setLoader] = useState(false)
  const [positiveWordCloud, setPositiveWordCloud] = useState([])
  const [negativeWordCloud, setNegativeWordCloud] = useState([])
  const [neutralWordCloud, setNEutralWordCloud] = useState([])


  useEffect( ()=> {
    axios.get('https://corona.lmao.ninja/v2/countries')
    .then(function (response) {
      var data = response.data
      var totalCases = data.reduce((prev,next) => prev + next.cases,0)
      var totalRecovered = data.reduce((prev,next) => prev + next.recovered,0)
      var totalDeath = data.reduce((prev,next) => prev + next.deaths,0)
      setStatDetails({total: totalCases, death:totalDeath, recovered: totalRecovered})
    })

    axios({url: 'https://twiter-sentiment-api.herokuapp.com/trending', method: 'get'})
    .then(function (response) {
      setTrendingData(response.data.slice(0, 10))
    })
  },[])

  const handleInput = (event) => {
    event.persist();
    setSearchKeyword(event.target.value)
  }

  const getSentimentData = () => {
    if (searchKeyword != ''){
      setLoader(true)
      axios({
        method: 'post',
        "headers": {
          "Content-Type": "application/json"
        },
        url: 'https://twiter-sentiment-api.herokuapp.com/',
        data:{
          keyword: searchKeyword,
        }
      }).then((response)=> {
        var data = JSON.parse(response.data)
        var mostRetweet = data.sort((a, b) => (a.retweet_count > b.retweet_count) ? -1 : 1)
        var positive = data.filter(key => key.pos > 0.1 )
        var negative = data.filter(key => key.neg > 0.1 )
        var neutral = data.filter(key => key.net > 0.1 )
        var postiveWord= []
        var negativeWord= []
        var neutralWord = []

        positive.map((item, key) =>
          postiveWord = item.filtered_words + postiveWord
        );
        negative.map((item, key) =>
          negativeWord = item.filtered_words + negativeWord
        );
        neutral.map((item, key) =>
          neutralWord = item.filtered_words + neutralWord
        );
        setPositiveWordCloud(countWord(postiveWord))
        setNegativeWordCloud(countWord(negativeWord))
        setNEutralWordCloud(countWord(neutralWord))


        setSentimentResponse(mostRetweet.slice(0, 3))
        setLoader(false)
      })
    }
  }
  const countWord = (arr)=> {
    if (arr != []){
      var wordCloud = (arr.length != 0) ? arr.split(",") : []
      var counts = {}
      wordCloud.forEach(function(x) {
        counts[x] = (counts[x] || 0)+1;
      });
      var objKeys =  Object.keys(counts)
      var objValues =  Object.values(counts)
      var newWordCLoud = []
      objKeys.map((item, key) => {
        if (key > 20) {
          newWordCLoud.push(objKeys[key])
        }
      })
      return newWordCLoud
    }else{
      return []
    }

  }
  return (
    <Container>
      <TextScroller text="Stay Safe" />
      <Row>
        <Col md={3}>
          <h3>Trending Topics</h3>
          {(trendingData || []).map((data) => {
            return(
              <>
                <p><a  key={data.name} href={data.url || ''}>{data.name}</a></p>
              </>
            )
          })}
        </Col>
        <Col md={6}>
          <Form >
            <FormGroup>
              <Input name="searchKeyword" className="search" placeholder="Enter keyword to search" onChange={handleInput}/>
            </FormGroup>
            <Button onClick={getSentimentData} className='ml-1'>Submit</Button>
          </Form>
          <div className="text-center pt-5">
            <Loader
              type="Circles"
              color="#00BFFF"
              height={200}
              width={200}
              visible={loader}
            />
          </div>
          {!loader && sentimentResponse.length == 0 && (
            <div className="text-center">
              <h3>Search a tag to classify tweets sentiment</h3>
              <img src={Sentiment} className="w-75" />
            </div>
          )}

          {positiveWordCloud.length > 0 && (
            <>
              <h4>Positive WordCoud</h4>
              <TagCloud
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '100%'
                }}>
                {positiveWordCloud.map((x) => {
                  return (<div>{x}</div>)
                })}

              </TagCloud>
            </>

          )
         }
          { neutralWordCloud.length > 0 && (
            <>
              <h4>Neutral WordCoud</h4>
              <TagCloud
                style={ {
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '100%'
                } }>
                { neutralWordCloud.map((x) => {
                  return (<div>{ x }</div>)
                }) }

              </TagCloud>
            </>

          )
          }
          {console.log(negativeWordCloud)}
          {negativeWordCloud.length > 0 && (
            <>
              <h4>Negative WordCoud</h4>
              <TagCloud
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '100%'
                }}>
                {negativeWordCloud.map((x) => {
                  return (<div>{x}</div>)
                })}
              </TagCloud>
            </>

          )
          }

          {sentimentResponse.length > 1 && (
            <>
              <h4/>
              <h3>Top retweet for {searchKeyword}</h3>
            </>
          )}
          {!loader && sentimentResponse && (sentimentResponse || []).map((response) => {
            return(
              <>
               <p><a href={`https://twitter.com/user/status/${response.id}`}>{response.tweet}</a></p>
              </>
              )
          } )}
        </Col>
        <Col md={3}>
          <div>
            <h3>Covid Cases</h3>
            <p>Total Cases: {statDetails.total}</p>
            <p>Total Death: {statDetails.death}</p>
            <p>Total Recovered: {statDetails.recovered}</p>
          </div>
          <a className="twitter-timeline"
             href="https://twitter.com/TwitterDev/timelines/539487832448843776?ref_src=twsrc%5Etfw">National
            Park Tweets - Curated tweets by TwitterDev</a>
          <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        </Col>
      </Row>
    </Container>
  )
}

export default App;
