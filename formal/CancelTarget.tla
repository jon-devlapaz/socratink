---------------------------- MODULE CancelTarget ----------------------------
(* Two browser tabs share one conversation. Server: browser-bridge.ts admits
   one pending submission at a time (409 otherwise) and its abort route raises
   the abort_through watermark (storage-*.ts cancel); engine.ts aborts a
   running submission once cancelThrough() >= its id. Client:
   src/ui/client/conversation.ts cancel() and recheck(). Cancel requests are
   messages that can arrive late. *)
EXTENDS Naturals, Sequences, FiniteSets

CONSTANTS Tabs, MaxSubmissions, AbortNamesSubmission

VARIABLES
    subs,          \* submissions by id: [owner, status]
    abortThrough,  \* the conversation's abort watermark
    tab,           \* per tab: phase, and the submission id it has learned (0 = none)
    inflight,      \* abort requests sent but not yet handled by the server
    intended       \* ghost: submission ids each tab meant to stop

vars == <<subs, abortThrough, tab, inflight, intended>>

Ids == 1..Len(subs)
Pending == {i \in Ids : subs[i].status = "pending"}
Max(S) == CHOOSE m \in S : \A x \in S : x <= m
OwnLatest(t) == LET own == {i \in Ids : subs[i].owner = t}
                IN IF own = {} THEN 0 ELSE Max(own)
SendAbort(t, id) == inflight' = inflight \union {[from |-> t, id |-> id]}

Init ==
    /\ subs = <<>>
    /\ abortThrough = 0
    /\ tab = [t \in Tabs |-> [phase |-> "idle", known |-> 0]]
    /\ inflight = {}
    /\ intended = [t \in Tabs |-> {}]

\* POST /:id (browser-bridge.ts): admitted only when nothing is pending (409 otherwise).
Send(t) ==
    /\ tab[t].phase = "idle"
    /\ Len(subs) < MaxSubmissions
    /\ Pending = {}
    /\ subs' = Append(subs, [owner |-> t, status |-> "pending"])
    /\ tab' = [tab EXCEPT ![t] = [phase |-> "sending", known |-> 0]]
    /\ UNCHANGED <<abortThrough, inflight, intended>>

\* The 202 reaches the tab, possibly late: pending.admission in conversation.ts.
LearnId(t) ==
    /\ tab[t].phase \in {"sending", "recovery", "cancelUnknown"}
    /\ tab[t].known = 0
    /\ tab' = [tab EXCEPT ![t] = [phase |-> IF @.phase = "sending" THEN "waiting" ELSE @.phase,
                                  known |-> OwnLatest(t)]]
    /\ UNCHANGED <<subs, abortThrough, inflight, intended>>

\* The send is interrupted or times out before its 202 arrives.
LoseAdmission(t) ==
    /\ tab[t].phase = "sending"
    /\ tab' = [tab EXCEPT ![t].phase = "recovery"]
    /\ UNCHANGED <<subs, abortThrough, inflight, intended>>

\* cancel() in conversation.ts.
Cancel(t) ==
    /\ tab[t].phase \in {"sending", "waiting", "recovery"}
    /\ intended' = [intended EXCEPT ![t] = @ \union {OwnLatest(t)}]
    /\ IF ~AbortNamesSubmission
       THEN /\ SendAbort(t, 0)
            /\ tab' = [tab EXCEPT ![t].phase = "cancelUnknown"]
       ELSE IF tab[t].known # 0
            THEN /\ SendAbort(t, tab[t].known)
                 /\ tab' = [tab EXCEPT ![t].phase = "idle"]
            ELSE /\ inflight' = inflight
                 /\ tab' = [tab EXCEPT ![t].phase = "cancelUnknown"]
    /\ UNCHANGED <<subs, abortThrough>>

\* recheck() in conversation.ts after a Cancel whose id was unknown.
Recheck(t) ==
    /\ tab[t].phase = "cancelUnknown"
    /\ IF ~AbortNamesSubmission
       THEN /\ SendAbort(t, 0)
            /\ tab' = tab
       ELSE /\ tab[t].known # 0
            /\ SendAbort(t, tab[t].known)
            /\ tab' = [tab EXCEPT ![t].phase = "idle"]
    /\ UNCHANGED <<subs, abortThrough, intended>>

\* Start over: the tab leaves an unresolved reply and can send again.
StartOver(t) ==
    /\ tab[t].phase \in {"recovery", "cancelUnknown"}
    /\ tab' = [tab EXCEPT ![t] = [phase |-> "idle", known |-> 0]]
    /\ UNCHANGED <<subs, abortThrough, inflight, intended>>

\* The /abort route and engine.abort(), possibly long after the request was sent.
\* Before #119: cancel through the newest pending submission, whoever started it.
\* After: cancel through the named submission, only if it is still pending.
DeliverAbort(r) ==
    /\ r \in inflight
    /\ inflight' = inflight \ {r}
    /\ abortThrough' =
         IF AbortNamesSubmission
         THEN IF r.id \in Pending /\ r.id > abortThrough THEN r.id ELSE abortThrough
         ELSE IF Pending # {} /\ Max(Pending) > abortThrough THEN Max(Pending) ELSE abortThrough
    /\ UNCHANGED <<subs, tab, intended>>

\* checkCancellation in engine.ts: aborted at or under the watermark, else it may complete.
Settle(i) ==
    /\ i \in Pending
    /\ subs' = [subs EXCEPT ![i].status = IF i <= abortThrough THEN "aborted" ELSE "done"]
    /\ UNCHANGED <<abortThrough, tab, inflight, intended>>

Next ==
    \/ \E t \in Tabs : Send(t) \/ LearnId(t) \/ LoseAdmission(t) \/ Cancel(t) \/ Recheck(t) \/ StartOver(t)
    \/ \E r \in inflight : DeliverAbort(r)
    \/ \E i \in Ids : Settle(i)

Spec == Init /\ [][Next]_vars

\* A reply is stopped only if its own tab meant to stop it.
CancelStopsOnlyIntendedReply ==
    \A i \in Ids : subs[i].status = "aborted" => i \in intended[subs[i].owner]

\* Sanity: Cancel can still stop a reply. TLC must find a violation of this.
NoReplyEverAborted == \A i \in Ids : subs[i].status # "aborted"
=============================================================================
