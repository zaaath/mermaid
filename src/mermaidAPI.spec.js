import mermaid from './mermaid';
import mermaidAPI from './mermaidAPI';
import assignWithDepth from './assignWithDepth';

describe('when using mermaidAPI and ', function () {
  describe('doing initialize ', function () {
    beforeEach(function () {
      document.body.innerHTML = '';
      mermaidAPI.globalReset();
    });

    it('should copy a literal into the configuration', function () {
      const orgConfig = mermaidAPI.getConfig();
      expect(orgConfig.testLiteral).toBe(undefined);

      mermaidAPI.initialize({ testLiteral: true });
      const config = mermaidAPI.getConfig();

      expect(config.testLiteral).toBe(true);
    });
    it('should copy a an object into the configuration', function () {
      const orgConfig = mermaidAPI.getConfig();
      expect(orgConfig.testObject).toBe(undefined);

      const object = {
        test1: 1,
        test2: false,
      };

      mermaidAPI.initialize({ testObject: object });
      let config = mermaidAPI.getConfig();

      expect(config.testObject.test1).toBe(1);
      mermaidAPI.updateSiteConfig({ testObject: { test3: true } });
      config = mermaidAPI.getConfig();

      expect(config.testObject.test1).toBe(1);
      expect(config.testObject.test2).toBe(false);
      expect(config.testObject.test3).toBe(true);
    });
    it('should reset mermaid config to global defaults', function () {
      let config = {
        logLevel: 0,
        securityLevel: 'loose',
      };
      mermaidAPI.initialize(config);
      mermaidAPI.setConfig({ securityLevel: 'strict', logLevel: 1 });
      expect(mermaidAPI.getConfig().logLevel).toBe(1);
      expect(mermaidAPI.getConfig().securityLevel).toBe('strict');
      mermaidAPI.globalReset();
      expect(mermaidAPI.getConfig().logLevel).toBe(0);
      expect(mermaidAPI.getConfig().securityLevel).toBe('loose');
    });

    it('should prevent changes to site defaults (sneaky)', function () {
      let config = {
        logLevel: 0,
      };
      mermaidAPI.initialize(config);
      const siteConfig = mermaidAPI.getSiteConfig();
      expect(mermaidAPI.getConfig().logLevel).toBe(0);
      config.secure = {
        toString: function () {
          mermaidAPI.initialize({ securityLevel: 'loose' });
        },
      };
      // mermaidAPI.reinitialize(config);
      expect(mermaidAPI.getConfig().secure).toEqual(mermaidAPI.getSiteConfig().secure);
      expect(mermaidAPI.getConfig().securityLevel).toBe('strict');
      mermaidAPI.reset();
      expect(mermaidAPI.getSiteConfig()).toEqual(siteConfig);
      expect(mermaidAPI.getConfig()).toEqual(siteConfig);
    });
    it('should prevent clobbering global defaults (direct)', function () {
      let config = assignWithDepth({}, mermaidAPI.defaultConfig);
      assignWithDepth(config, { logLevel: 0 });

      let error = { message: '' };
      try {
        mermaidAPI['defaultConfig'] = config;
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe(
        "Cannot assign to read only property 'defaultConfig' of object '#<Object>'"
      );
      expect(mermaidAPI.defaultConfig['logLevel']).toBe(5);
    });
    it('should prevent changes to global defaults (direct)', function () {
      let error = { message: '' };
      try {
        mermaidAPI.defaultConfig['logLevel'] = 0;
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe(
        "Cannot assign to read only property 'logLevel' of object '#<Object>'"
      );
      expect(mermaidAPI.defaultConfig['logLevel']).toBe(5);
    });
    it('should prevent sneaky changes to global defaults (assignWithDepth)', function () {
      let config = {
        logLevel: 0,
      };
      let error = { message: '' };
      try {
        assignWithDepth(mermaidAPI.defaultConfig, config);
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe(
        "Cannot assign to read only property 'logLevel' of object '#<Object>'"
      );
      expect(mermaidAPI.defaultConfig['logLevel']).toBe(5);
    });
  });
  describe('dompurify config', function () {
    it('should allow dompurify config to be set', function () {
      mermaidAPI.initialize({ dompurifyConfig: { ADD_ATTR: ['onclick'] } });
      expect(mermaidAPI.getConfig().dompurifyConfig.ADD_ATTR).toEqual(['onclick']);
    });
  });
  describe('test mermaidApi.parse() for checking validity of input ', function () {
    mermaid.parseError = undefined; // ensure it parseError undefined
    it('it should throw for an invalid definition (with no mermaid.parseError() defined)', function () {
      expect(mermaid.parseError).toEqual(undefined);
      expect(() => mermaidAPI.parse('this is not a mermaid diagram definition')).toThrow();
    });
    it('it should not throw for a valid definition', function () {
      expect(() => mermaidAPI.parse('graph TD;A--x|text including URL space|B;')).not.toThrow();
    });
    it('it should return false for invalid definition WITH a parseError() callback defined', function () {
      var parseErrorWasCalled = false;
      // also test setParseErrorHandler() call working to set mermaid.parseError
      mermaid.setParseErrorHandler(function (error, hash) {
        // got here.
        parseErrorWasCalled = true;
      });
      expect(mermaid.parseError).not.toEqual(undefined);
      expect(mermaidAPI.parse('this is not a mermaid diagram definition')).toEqual(false);
      expect(parseErrorWasCalled).toEqual(true);
    });
    it('it should return true for valid definition', function () {
      expect(mermaidAPI.parse('graph TD;A--x|text including URL space|B;')).toEqual(true);
    });
  });
});
