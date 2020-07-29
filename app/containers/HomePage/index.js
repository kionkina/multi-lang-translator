/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import $ from 'jquery';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
// import axios from 'axios';
import reducer from './reducer';
import saga from './saga';

const key = 'home';

export function HomePage({ loading, error, repos }) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  const [word, setWord] = useState('');
  const [spanish, setSpanish] = useState(['']);
  const [chinese, setChinese] = useState(['']);
  const [pinyin, setPinyin] = useState(['']);

  const submitForm = e => {
    e.preventDefault();
    languageReq('es');
    languageReq('zh-CN');
  };

  const char2pinyin = chars => {
    const pinyin = [];
    chars.map(char => {
      const settings = {
        async: true,
        crossDomain: true,
        url: `https://helloacm.com/api/pinyin/?cached&s=${char}&t=1`,
        method: 'POST',
        headers: {},
      };

      $.ajax(settings).done(function(response) {
        pinyin.push(response.result.join(' '));
        setPinyin(pinyin);
      });
    });
  };

  const languageReq = language => {
    const settings = {
      async: true,
      crossDomain: true,
      url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
      method: 'POST',
      headers: {
        'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
        'x-rapidapi-key': process.env.API_KEY,
        'accept-encoding': 'application/gzip',
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        source: 'en',
        q: word,
        target: language,
      },
    };

    $.ajax(settings).done(function(response) {
      if (language === 'es') {
        const translations = response.data.translations.map(
          translation => translation.translatedText,
        );
        setSpanish(translations);
      } else {
        const chars = response.data.translations.map(
          translation => translation.translatedText,
        );
        setChinese(chars);
        char2pinyin(chars);
      }
    });
  };

  return (
    <React.Fragment>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <form>
          <div className="input-group">
            <label htmlFor="word">English Word</label>
            <br />
            <input
              type="word"
              name="word"
              id="word"
              value={word}
              onChange={event => {
                setWord(event.target.value);
              }}
              title="Word"
              required
            />
            <button onClick={event => submitForm(event)}>Translate</button>
          </div>
        </form>
        <br />
        <br />
        <b> SPANISH </b>
        <div> {spanish[0]} </div>
        <br />
        <br />
        <b> CHINESE </b>
        <div> {chinese[0]} </div>
        {pinyin[0]}
      </div>
    </React.Fragment>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
