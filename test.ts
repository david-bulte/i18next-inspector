export class Test {

    constructor(private i18nPipe: I18NPipe) {}

    translate() {
        this.i18nPipe.transform('this.key.is.called.programmatically');
        this.i18nPipe.transform('this.key.is.called.programmatically.too');

        this.i18n.transform('this.key.is.called.programmatically.too');
    }
}
