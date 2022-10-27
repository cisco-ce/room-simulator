// TODO
// * Report bug: when adding sources and tapping select after, it does not get selected in sharetray until reopen
// * Feedback listener gets accumulated when adding/removing sources
// * Possible to select input connector
import Model from './model';

class Source extends Model {
  constructor(sourceIdentifier, name, connectorId) {
    super();
    this.connectorId = connectorId;
    this.sourceIdentifier = sourceIdentifier;
    this.name = name;
    this.type = 'mediaplayer';
    this.state = 'NotReady';
  }

  isReady() {
    return this.state === 'Ready';
  }

  getState() {
    return this.state;
  }

  // Return value is the new on/off state
  setState(state) {
    this.state = state;
    this.notify();
  }
}

export default class SourceList extends Model {

  constructor(codec) {
    super();
    this.codec = codec;
    this.createSources();
    this.selectFirstAvailable();
  }

  createSources(connectorId = 2) {
    this.sources = new Map();
    this.sources.set('appletv', new Source('appletv', 'Apple TV', connectorId));
    this.sources.set('bluray', new Source('bluray', 'Blu-ray', connectorId));
    this.sources.set('tv', new Source('tv', 'TV', connectorId));
  }

  getSources() {
    return this.sources;
  }

  getSource(sourceId) {
    return this.sources.get(sourceId);
  }

  getSelectedSourceIdentifier() {
    return this.selectedSourceIdentifier;
  }

  togglePower(sourceIdentifier) {
    const willTurnOn = !this.getSource(sourceIdentifier).isReady();

    this.getSource(sourceIdentifier).setState(
      willTurnOn ? 'Ready' : 'NotReady',
    );

    if (willTurnOn) {
      this.selectSource(sourceIdentifier);
    } else if (this.selectedSourceIdentifier === sourceIdentifier) {
      // need to find select another source
      this.selectFirstAvailable();
    }
    return willTurnOn;
  }

  selectFirstAvailable() {
    for (const source of this.sources.values()) {
      if (source.isReady()) {
        this.selectSource(source.sourceIdentifier);
        return;
      }
    }
    this.selectSource(false);
  }

  onSourceSeleted(sourceIdentifier) {
    this.selectedSourceIdentifier = sourceIdentifier;
    // console.log('source model: selected', sourceIdentifier);
    this.notify();
  }

  selectSource(sourceIdentifier) {
    // disable for now
    const adapter = this.codec;
    if (adapter) {
      adapter.selectExternalSource(sourceIdentifier);
    }
    this.onSourceSeleted(sourceIdentifier);
  }
}
