import './index.css'
import { LevelScene } from './components/LevelScene'
import { RuleIntroModal } from './components/RuleIntroModal'
import { VictoryOverlay } from './components/VictoryOverlay'
import { useGameController } from './game/useGameController'

function App() {
  const game = useGameController()

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <LevelScene
          level={game.activeLevel}
          snapshot={game.snapshot}
          servingBottleIds={game.servingBottleIds}
          pourAnimation={game.pourAnimation}
          toast={game.toast}
          onBottleClick={game.handleBottleClick}
          onUndo={game.undoMove}
          onReset={game.shuffleReset}
          onAddGlass={game.addBottle}
        />

        {game.ruleIntro ? (
          <RuleIntroModal intro={game.ruleIntro} onClose={game.dismissRuleIntro} />
        ) : null}

        {game.showVictory ? (
          <VictoryOverlay
            level={game.activeLevel}
            rewardProgress={game.snapshot.rewardProgress}
            onContinue={game.continueToNextLevel}
          />
        ) : null}
      </div>
    </main>
  )
}

export default App
