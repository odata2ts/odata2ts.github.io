---
id: response-shaping
title: Response Shaping
sidebar_position: 1
---

# Response Shaping

Most REST APIs answer with whatever the endpoint was built to return. The shape of a response is the
server's decision, made at design time and identical for everyone who calls it.

OData turns that around. A request states which properties it wants and which related entities should come
along with them, and the response carries that and nothing else. The consumer describes the shape it needs,
the service produces it. [GraphQL](https://graphql.org/) should come to mind — the same idea, expressed as
query options on a URL rather than as a query language of its own.

Of everything OData offers, this is the capability that changes the most about how a service is built and
consumed.

## One API for Every Client

A list view needs three properties per row. The detail view behind it needs forty, together with the
customer and the most recent orders. A mobile client wants a fraction of either, and a report wants
something different again.

Where responses are fixed, each of those is a negotiation with whoever owns the service. It ends in one of
three places: a new endpoint per view, a query parameter that slowly grows into a private dialect, or a
layer in front of the real service whose entire job is to trim and recombine what that service returned.
All three multiply the things that must be built, versioned and kept in step.

With response shaping they are one and the same resource. The variation moves out of the service and to the
caller, which is where the knowledge about what a given screen needs actually lives. A new view ships
without the API being touched; a view that changes its mind does not ripple backwards into it. The service
describes what exists, and each consumer decides what it wants to see of it.

## Fewer Round Trips

Relationships can be traversed inside a single request. An entity and the entities it relates to come back
together, nested as deeply as the model allows, and the client chooses per relationship whether it wants
the related entities at all.

Without that, related data means asking again: fetch the parent, look at what it points to, fetch that.
Repeated across a collection this is the familiar N+1 problem, moved off the database and onto the network,
where every additional hop costs a full round trip rather than a query. Shaping collapses that back into
one exchange.

## Neither Too Much Nor Too Little

Fixed responses fail in two directions, and usually in both at once across a large enough application.

Point an endpoint built for a detail view at a list and most of what arrives is discarded — the work of
producing it was done, paid for and thrown away. Point an endpoint built for a list at a detail view and it
does not carry enough, so something has to ask a second time. Over-fetching wastes; under-fetching costs a
round trip.

Neither can arise when the request defines the response. What comes back is what was asked for, so whether
the endpoint happens to fit this particular caller stops being a question.

## Less on the Wire

What is not asked for is not serialized, not transferred and, in a service that pushes the shape down far
enough, not even read from the store.

The effect grows with the gap between what an entity holds and what a caller needs: wide entities, long
text, anything binary, relationships that are expensive to resolve. It is felt most where bandwidth is
scarce or latency is high — mobile clients, metered connections, anything crossing a continent.
