import { either as E } from 'fp-ts'

// Functional Composition
const capitalizeMessage = (message: string) => message.substring(0, 1).toUpperCase() + message.substring(1)
const enhanceMessage = (message: string) => `${message} is awesome`
const logMessage = (message: string) => console.log(message)

// /* EXAMPLE 1 */
// // What you're used to
// const capitalizedMessage = capitalizeMessage('functional programming')
// const enhancedMessage = enhanceMessage(capitalizedMessage)
// logMessage(enhancedMessage)

// /* EXAMPLE 2 */
// // Refactoring a bit into a pipeline
// logMessage(enhanceMessage(capitalizeMessage('functional programming')))
// // notice that there is a clear input, and that input is piped into a series of functions, we can abstract this
// // also notice that before I can do anything, I must have the original message before I can kick of this chain of functions

// /* EXAMPLE 3 */
// // let's refactor a bit more by
// // 1. abstracting the composition of the function (getting rid of the need for intermediary variables)
// // 2. invert dependencies (starting message is the last thing we need instead of the first)
const compose = <A, B, C, D>(f1: (value: A) => B, f2: (value: B) => C, f3: (value: C) => D) => {
    return (value: A) => f3(f2(f1(value)))
}

// // now I can compose the functions together to make a new function, without ever knowing what the input is
// // nobody will accidentally make a mistake and use the wrong variable in the wrong place
// const logEnhancedMessage = compose(
//     capitalizeMessage,
//     enhanceMessage,
//     logMessage
// )

// // finally, using this function is just as easy as before with a backwards compatible type signature
// logEnhancedMessage('functional programming')

// Looking back at our compose function, the arguments are just a bunch of mapping functions
// We chain all of those mapping functions together, then give it input, and off it goes
// When we compose these mapping functions together, we get a big mapping function
// compose(A => B, B => C) is really just a mapping function A => C

// Conclusion, it is exceedingly easy to compose functions, just invert dependencies and make the types of your functions line up A => B => C => D
// STOP for questions, this is the first premise for monads
// From this point on, there will be many, many white lies, so if you know category theory and lambda calculus, please keep it to yourself until the end :)

// FUNCTOR: an object that
// 1. contains a value and can be constructed purely from this value (this is the unit operation that just wraps the value)
// 2. can be mapped

// with those two requirements in mind, a couple of functors you've seen before are Array and Promise

interface Functor<A> {
    map<B>(transform: (a: A) => B): Functor<B>
}

// one concrete implementation of a functor
class ExampleFunctor<A> implements Functor<A> {
    constructor(private value: A) {}

    map<B>(transform: (a: A) => B): Functor<B> {
        return new ExampleFunctor(transform(this.value))
    }
}

/* Example 4 */
// new ExampleFunctor('Functional programming')
//     .map(capitalizeMessage)
//     .map(enhanceMessage)
//     .map(logMessage)
// // Notice that we still have our 3 initial functions, we haven't modified them at all, everything we've done so far
// // is about composing the functions we already have, not rewriting them

// // Also notice that we have the same problem we had before with input being required up front, I want input at the end
// // We can fix this by externalizing the map function entirely
// const map = <A, B>(functor: Functor<A>, transform: (value: A) => B) => functor.map(transform)

// // which let's us refactor to something like this
// map(
//     map(
//         map(
//             new ExampleFunctor('Functional programming'),
//             capitalizeMessage
//         ),
//         enhanceMessage
//     ),
//     logMessage
// )

/* Example 5 */
// this looks a lot like our pipeline we had initially, we should use compose! But for compose to work, we need to be able
// to provide the data (new ExampleFunctor('Functional programming')) at the end

// const curriedMap = <A, B>(transform: (value: A) => B) => (functor: Functor<A>) => functor.map(transform)

// compose(
//     curriedMap(capitalizeMessage),
//     curriedMap(enhanceMessage),
//     curriedMap(logMessage),
// )(new ExampleFunctor('Functional programming'))

// cool, so I took example #3, made the map function more complex, and forced you to wrap your values in this thing called a functor
// so I took a good thing, and made it harder, why?
// as a reminder, a Functor is a container for a value, and that container can be mapped
// STOP for questions, this is the second premise for monads

// The reason we've wrapped this value is it gives us more control. One of the most common things to do with all of those map functions
// we specified in example #1 is to add null checks to everything. And if it is null, what do you do? Return a default value? What's the
// default value for a number? 0? Maybe just return another null? So the next function can fail too? But then after composing everything
// together, I have to do another null check because it's possible there was an error and null got passed all the way through? And if that
// happened, what was the actual problem?

// Let's create a Monad to solve our problem. But first, what is a monad?
// Monads have three requirements, two of which are the same as Functor
// 1. contains a value and can be constructed purely from this value (this is the unit operation that just wraps the value)
// 2. can be mapped
// 3. can be flattened (normally called unwrapping)

// As a side note, if you combine flattening and mapping, you get flatMap (or what it's normally called, chain). Chain/FlatMap is
// significantly more useful than having a flatten function, so many times, you won't have a flatten function, you'll have map and chain

// So really, a Monad is just a convenient Functor, because flatMapping is just flattening on top of the mapping that we can already do with Functors

// Let's create the simplest Monad possible, the Identity Monad
interface Monad<A> extends Functor<A> {
    map<U>(f: (value: A) => U): Monad<U>
    chain<U>(f: (value: A) => Monad<U>): Monad<U>
}

/* EXAMPLE 6 */
// class Maybe<A> implements Monad<A> {
//     private constructor(private value: A | undefined) {}

//     static just<B>(value: B) {
//         return new Maybe<B>(value)
//     }

//     static nothing<B>() {
//         return new Maybe<B>(undefined)
//     }

//     static ofNullable<B>(value: B) {
//         if (value === null || value === undefined) {
//             return Maybe.nothing<B>()
//         } else {
//             return Maybe.just(value)
//         }
//     }

//     map<U>(f: (value: A) => U): Maybe<U> {
//         if (this.value === undefined) {
//             return Maybe.nothing<U>()
//         } else {
//             return Maybe.just<U>(f(this.value))
//         }
//     }

//     chain<U>(f: (value: A) => Monad<U>): Monad<U> {
//         if (this.value === undefined) {
//             return Maybe.nothing<U>()
//         } else {
//             return f(this.value)
//         }
//     }
// }

// Maybe.ofNullable('functional programming')
//     .map(capitalizeMessage)
//     .map(enhanceMessage)
//     .map(logMessage)

// And just like we have before, with most functional libraries, you'll see the map and chain functions externalized
// so they can be used with the compose function

// The reason we use Monads instead of random mapping functions is because they are standardized, a Maybe monad implementing
// the fantasy-land specification (https://github.com/fantasyland/fantasy-land) which is the main functional specification
// works the same everywhere. You can consume libraries that have dozens of functors already created and formally (mathematically)
// verified to work. And as you can see with the liberal use of generics, each of these Monads is very versatile. These types of
// abstractions prevent you from having to do significant rework when refactoring. Combining with functional composition makes
// the abstractions even more powerful.

// So that's why mapping functions aren't always good enough, we do eventually need Monads.

// Quickly summarizing the high level concepts common in functional programming (including the examples above)

/* 1. Dependency Injection: Functions can always be (and normally are) externalized into pure functions. When all dependencies
 *    are called out for every function, they can be completely tested at every level (unit tests, module tests, integration tests, etc)
 * 2. Functional Composition: Functional composition allows us to compose little functions together without having to test,
 *    "system under test called this function, then this function, then that function" because we are using a declarative style
 * 3. Generics: We tend to heavily use generics because the underlying types (like functors and monads) are generic.
 */

// But why do any of this at all? What is the realistic benefit of using functional programming at all? Like in a real production
// language like Typescript, not an academic language like Haskell.

/* You'll have to trust me on some of these, they come with experience working functionally
 * 1. Pure functions are extremely easy to reason about and test. And when you pipeline functions in a declarative way using
 *    compose, it is much easier to read and understand a codebase
 * 2. Debugging is extremely easy, since everything is a pipeline, I can insert debugging anywhere in the pipeline.
 * 3. Parallel programming is much easier since you're working with pipelines (and pipelines can be parallelized often times)
 * 4. You program at a higher level, for example, you would never have a null check, you would use Maybe. Since you program at this
 *    level, it is far easier to abstract something away in a generic way and see what levels of abstraction you need.
 * 5. Libraries you create plug into anything. Functional libraries are all about exposing useful Monads or pipeline stages.
 * 6. Lazy evaluation, when you compose, you don't actually execute the function until the very last input
 * 7. Side effects are avoided, making testing far easier
 */

// TALK ABOUT HOW TO USE IN REAL LIFE, FUNCTIONAL ISN'T THE ANSWER TO EVERYTHING

// A few real examples from my codebases, without knowing anything about the codebase, the functions should make some sense

// All responses from external services are validated before processing
//  const validateBodyInner = (createLogger: LoggerFactory) => <T>(type: t.Type<T, unknown>) => (
//     body: unknown,
//   ): E.Either<Err<'BODY_VALIDATION_ERROR'>, T> =>
//     pipe(
//       decode(type, body),
//       mapErrorCode('BODY_VALIDATION_ERROR' as const),
//       logErrors(createLogger()),
//     )
// export const validateBody = validateBodyInner(getSystemLogger)

// // example controller
// router.post(
//     '/foobar',
//     rateLimitingMiddleware(createLimiter('foobar'), ctx => ctx.ip), // limit throughput based on IP
//     enforceWithBodyRole('account', ['editAny']), // require an authenticated account with editAny role
//     withValidatedBody(t.type({ message: t.string }))(async ctx => { // validate the body from the request before processing
//         // secret things
//     }),
//     validateResponse(t.string), // validate the response to ensure consistency with schema
// )

// // // given a set of unknown headers, make sure the user is authorized to do what they're trying to do
// const enforceWithAuthHeader = (enforceProvider: EnforceProvider) => (
//     configProvider: ConfigProvider,
//   ) => <T, U>(resource: T, actions: U[]) => (
//     headers: unknown,
//   ): TE.TaskEither<Err, void> => // Either auth succeeds and nothing happens, or I get an error back
//     pipe(
//       resolveAuthHeader(headers), // parse auth header
//       E.chain(verifyAndParseToken(configProvider)), // parse token
//       TE.fromEither,
//       TE.chain(({ role }) => enforceRole(enforceProvider)(resource)(actions)(role)), // validate token with auth server
//     )