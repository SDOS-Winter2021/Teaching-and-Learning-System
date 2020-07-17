import React, {Component} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View, TextInput} from 'react-native';
import {Text, Button} from 'react-native-elements';
import moment from 'moment';
import Options from './Options';
import QuizResponses from '../../Databases/QuizResponses';
import CountDown from 'react-native-countdown-component';
import QuizResultGraph from './QuizResultGraph';
import Quiz from '../../Databases/Quiz';
import Toast from 'react-native-simple-toast';

export default class QuizStudentPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course : this.props.course,
            user : this.props.user,
            option : "",
            icon : "",
            error : null,
            correctAnswer : "",
            quizResults : false,
            date : "",
            results :"",
        };
        this.setOption = this.setOption.bind(this);
        this.quizresultData = this.quizresultData.bind(this);
    }

    quizresultData(resultData) {
        this.setState({
            results: resultData
        })
    }

    setOption(value){
        this.setState({
            option : value,
            icon : value,
        })
    }

    getCorrectAnswer = async () =>{
        const Kbc = new Quiz()
        Kbc.getTiming(this.state.course.passCode).then(value => {
            this.setState({
                correctAnswer : value["correctAnswer"],
                date : value["startTime"]
            })
        })
    }

    submitResponse = async () => {

        const {option} = this.state;

        if (option === '') {
            this.setState({
                error: "Please answer"
            })
        } else {
            Toast.show('Answer has been recorded!');
            const kbcresponse = new QuizResponses()
            const timestamp = moment().format("DD/MM/YYYY HH:mm:ss")

            await kbcresponse.getResponse(this.state.user.url, this.state.course.passCode)
                .then((url) => {
                    if (url === null) {
                        kbcresponse.createResponse(
                            this.state.course.passCode,
                            this.state.user.url,
                            this.state.user.email,
                            option,
                            timestamp
                        ).then(r => {
                                console.log("update")
                            })
                    } else {
                        kbcresponse.setResponse(
                            this.state.course.passCode,
                            this.state.user.url,
                            this.state.user.email,
                            option,
                            timestamp,
                            url
                        ).then(r => {
                                console.log("create")
                            })

                    }
                })

        }

    }

    render() {
        return(
            <SafeAreaView style={styles.safeContainer}>
            {   this.props.currentQuiz === false
                    ?
                    this.state.quizResults === false
                    ?
                        <ScrollView>
                            <Text style={styles.or}> Wohoo! No current quiz!</Text>
                        </ScrollView>
                    :
                        <ScrollView>
                            <QuizResultGraph passCode={this.state.course.passCode}
                                             correctAnswer={this.state.correctAnswer}
                                             date={this.state.date}
                                             quizType={this.props.quizType}
                                             quizresultData={this.quizresultData} />
                        </ScrollView>
                    :
                    <ScrollView>

                        <Text style={styles.heading}> In-Class Quiz</Text>

                        <CountDown
                            until={this.props.currentDuration}
                            size={30}
                            onFinish={() => {
                                this.setState({
                                    quizResults : true,
                                    option: "",
                                    icon: "",
                                    error: null
                                })
                                this.props.setQuizState()
                                this.getCorrectAnswer().then(r=>{console.log("")})
                            }}
                            digitStyle={{backgroundColor: '#FFF'}}
                            digitTxtStyle={{color: '#2697BF'}}
                            timeToShow={['M', 'S']}
                            timeLabels={{m: 'Min', s: 'Sec'}}
                        />
                        {this.props.quizType==="mcq"
                        ?
                            <View style={{paddingRight:20, paddingLeft:20}}>
                                <Options optionValue={this.setOption} icon={this.state.icon}/>
                                <View style={{padding:40}}>
                                    {this.state.error ?
                                        <Text style={styles.errorMessage}>
                                            {this.state.error}
                                        </Text> : <Text/>
                                    }
                                        <Button style={styles.buttonMessage} title="SUBMIT" onPress={this.submitResponse}/>
                                </View>
                            </View>
                            :
                            this.props.quizType==="numerical"
                            ?
                            <View style={{paddingTop:30}}>
                                <TextInput
                                    style={styles.textInput}
                                    onChangeText={text => {this.setState({
                                        option : text
                                    })}}
                                    value={this.state.option}
                                />
                                {this.state.error ?
                                    <Text style={styles.errorMessage}>
                                        {this.state.error}
                                    </Text> : <Text/>
                                }
                                <View style={{paddingTop:20}}>
                                    <Button style={styles.buttonMessage} title="SUBMIT" onPress={this.submitResponse}/>
                                </View>
                            </View>
                            :
                            <Text/>
                        }
                    </ScrollView>
            }
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    textInput: {
        width: '100%',
        paddingTop: 55,
        paddingBottom: 15,
        alignSelf: "center",
        borderColor: "#ccc",
        borderBottomWidth: 1,
    },
    heading : {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop : 25,
        padding: 15,
        fontSize : 25,
        fontWeight: "bold",
        color: 'grey',
        marginTop: 5,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 35,
    },

    errorMessage: {
        color: 'red',
        marginBottom: 15,
        paddingTop : 20,
        paddingBottom: 10,
    },
    buttonMessage: {
        paddingTop : 20,
        marginTop: 40,
    },
    or: {
        marginTop: 200,
        color: 'grey',
        alignSelf: "center",
        fontSize: 22,
        paddingBottom: 20,
        fontWeight : "bold"
    },
})

