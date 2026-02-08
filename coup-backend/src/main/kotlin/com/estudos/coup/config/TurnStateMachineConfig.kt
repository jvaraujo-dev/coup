package com.estudos.coup.config

import com.estudos.coup.model.TurnEvent
import com.estudos.coup.model.TurnState
import org.springframework.context.annotation.Configuration
import org.springframework.statemachine.config.EnableStateMachineFactory
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer

@Configuration
@EnableStateMachineFactory
open class TurnStateMachineConfig : EnumStateMachineConfigurerAdapter<TurnState, TurnEvent>() {

    override fun configure(states: StateMachineStateConfigurer<TurnState, TurnEvent>) {
        states
            .withStates()
            .initial(TurnState.AWAITING_ACTION)
            .states(TurnState.entries.toSet())
            .end(TurnState.ACTION_FINALIZED)
            .end(TurnState.CHALLENGE_LOSE)
            .end(TurnState.COUNTER_ACTION_ACCEPTED)
            .end(TurnState.COUNTER_ACTION_CHALLENGE_LOSE)
    }

    override fun configure(transitions: StateMachineTransitionConfigurer<TurnState, TurnEvent>) {
        transitions
            .withExternal()
                .source(TurnState.AWAITING_ACTION)
                .target(TurnState.AWAITING_CHALLENGE_OR_COUNTER_ACTION)
                .event(TurnEvent.ACTION)
                .and()
            .withExternal()
                .source(TurnState.AWAITING_CHALLENGE_OR_COUNTER_ACTION)
                .target(TurnState.ACTION_FINALIZED)
                .event(TurnEvent.ACCEPT)
                .and()
            .withExternal()
                .source(TurnState.AWAITING_CHALLENGE_OR_COUNTER_ACTION)
                .target(TurnState.CHALLENGED)
                .event(TurnEvent.CHALLENGE)
                .and()
            .withExternal()
                .source(TurnState.AWAITING_CHALLENGE_OR_COUNTER_ACTION)
                .target(TurnState.COUNTER_ACTION)
                .event(TurnEvent.COUNTER_ACTION)
                .and()
            .withExternal()
                .source(TurnState.CHALLENGED)
                .target(TurnState.CHALLENGE_WIN)
                .event(TurnEvent.PROOF)
                .and()
            .withExternal()
                .source(TurnState.CHALLENGED)
                .target(TurnState.CHALLENGE_LOSE)
                .event(TurnEvent.SHAM)
                .and()
    }
}
