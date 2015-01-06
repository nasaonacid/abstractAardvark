from nltk.corpus import wordnet as wn

def _recurse_all_hyponyms(synset, all_hyponyms):
    synset_hyponyms = synset.hyponyms()
    if synset_hyponyms:
        all_hyponyms += synset_hyponyms
        for hyponym in synset_hyponyms:
            _recurse_all_hyponyms(hyponym, all_hyponyms)

def all_hyponyms(synset):
    """Get the set of the tree of hyponyms under the synset"""
    hyponyms = []
    _recurse_all_hyponyms(synset, hyponyms)
    return set(hyponyms)


