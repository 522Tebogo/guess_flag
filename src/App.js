import React, { useState, useEffect } from 'react';
import countries from './countries';
import './App.css';

function App() {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0); // 连击数
  const [usedCountries, setUsedCountries] = useState([]); // 已使用的国家

  // 初始化游戏
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = () => {
    setScore(0);
    setLives(5);
    setGameOver(false);
    setMessage('');
    setSelectedAnswer(null);
    setStreak(0);
    setUsedCountries([]); // 重置已使用的国家列表
    generateQuestion([]);
  };

  // 生成新问题
  const generateQuestion = (used = usedCountries) => {
    setSelectedAnswer(null);
    setMessage('');
    
    // 检查是否所有国家都已使用
    if (used.length >= countries.length) {
      // 如果所有国家都已使用，则重置已使用列表
      setUsedCountries([]);
      used = [];
    }
    
    // 过滤出未使用的国家
    const availableCountries = countries.filter(country => !used.includes(country.name));
    
    // 如果没有可用国家，则重置列表
    if (availableCountries.length === 0) {
      setUsedCountries([]);
      used = [];
    }
    
    // 随机选择一个国家作为正确答案
    const available = countries.filter(country => !used.includes(country.name));
    const randomCountry = available[Math.floor(Math.random() * available.length)];
    
    // 更新已使用国家列表
    const newUsedCountries = [...used, randomCountry.name];
    setUsedCountries(newUsedCountries);
    setCurrentCountry(randomCountry);
    
    // 创建选项数组，包含正确答案和3个错误答案
    const correctAnswer = randomCountry.name;
    const wrongAnswers = countries
      .filter(country => country.name !== correctAnswer && !newUsedCountries.includes(country.name))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(country => country.name);
    
    // 如果可用的错误答案不足3个，则从已使用国家中补充
    if (wrongAnswers.length < 3) {
      const additionalWrongAnswers = countries
        .filter(country => country.name !== correctAnswer && !wrongAnswers.includes(country.name))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - wrongAnswers.length)
        .map(country => country.name);
      wrongAnswers.push(...additionalWrongAnswers);
    }
    
    // 合并选项并随机排序
    const allOptions = [correctAnswer, ...wrongAnswers]
      .sort(() => 0.5 - Math.random());
    
    setOptions(allOptions);
  };

  // 处理用户选择答案
  const handleAnswer = (selectedOption) => {
    if (gameOver || selectedAnswer) return;
    
    setSelectedAnswer(selectedOption);
    
    if (selectedOption === currentCountry.name) {
      // 答对了
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(score + newStreak); // 连击奖励
      setMessage(newStreak > 1 ? `正确！👍 ${newStreak}连击!` : '正确！👍');
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      // 答错了
      setStreak(0); // 重置连击
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        // 游戏结束
        setGameOver(true);
        setMessage('游戏结束！😢');
      } else {
        // 还有生命值
        setMessage(`错误！正确答案是${currentCountry.name}`);
        setTimeout(() => {
          generateQuestion();
        }, 1500);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌎 Guess The Flag</h1>
      </header>
      
      <main className="game-container">
        {gameOver ? (
          <div className="game-over">
            <h2>游戏结束</h2>
            <p>您的得分: {score}</p>
            <button className="restart-button" onClick={startNewGame}>
              重新开始
            </button>
          </div>
        ) : (
          <>
            <div className="game-info">
              <div className="score">得分: {score}</div>
              <div className="lives">生命: 
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>
                    {i < lives ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            </div>
            
            {currentCountry && (
              <div className="flag-container">
                <div className="flag">{currentCountry.flag}</div>
              </div>
            )}
            
            {/* 恢复原来的消息提示位置 */}
            {message && (
              <div className={`message ${message.includes('正确') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            
            <div className="options-container">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    selectedAnswer 
                      ? option === currentCountry.name 
                        ? 'correct' 
                        : option === selectedAnswer 
                          ? 'incorrect' 
                          : ''
                      : ''
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
      
      <footer className="App-footer">
        <p>你有5次错误机会，错误过后就要重新开始</p>
        <p>连击答题可获得额外分数奖励！</p>
      </footer>
    </div>
  );
}

export default App;