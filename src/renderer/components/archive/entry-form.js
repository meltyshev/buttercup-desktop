import PropTypes from 'prop-types';
import React, { PureComponent, Fragment } from 'react';
import { Field, FieldArray } from 'redux-form';
import { MdAdd as PlusIcon, MdDelete as RemoveIcon } from 'react-icons/md';
import { translate } from 'react-i18next';
import { Translate } from '../../../shared/i18n';
import { Button } from '@buttercup/ui';
import Heading from './heading';
import Input from './entry-input';
import EntryIcon from './entry-icon';
import { LabelWrapper, MetaWrapper, Row } from './entry-view';
import { createFieldDescriptor } from '../../../shared/buttercup/buttercup';

function getPlaceholder(propertyName) {
  switch (propertyName) {
    case 'title':
      return 'entry.untitled';
    case 'username':
      return 'entry.username';
    case 'password':
      return 'entry.secure-password';
    default:
      return 'entry.new-field';
  }
}

function shouldShowSeparator(index, field, fields) {
  if (
    (field.removeable === false && index === fields.length - 1) ||
    (field.removeable === false && fields.get(index + 1).removeable === true)
  ) {
    return true;
  }
  return false;
}

const renderMeta = (
  { fields, t, icon, meta: { touched, error } } // eslint-disable-line react/prop-types
) => (
  <>
    <MetaWrapper>
      {fields.map((member, index) => {
        const field = fields.get(index);
        if (field.propertyType !== 'property') return null;
        const isTitle =
          field.property === 'title' && field.removeable === false;
        return (
          <Fragment key={index}>
            <Row>
              <LabelWrapper>
                <Choose>
                  <When condition={isTitle}>
                    <EntryIcon icon={icon} big />
                  </When>
                  <When condition={field.removeable}>
                    <Field
                      name={`${member}.property`}
                      type="text"
                      component="input"
                      placeholder={t('entry.label')}
                    />
                  </When>
                  <Otherwise>
                    <Translate
                      i18nKey={`entry.${field.property}`}
                      parent="span"
                    />
                  </Otherwise>
                </Choose>
              </LabelWrapper>
              <Field
                name={`${member}.value`}
                type={field.valueType}
                component={Input}
                placeholder={t(getPlaceholder(field.property))}
                isBig={isTitle}
                autoFocus={isTitle}
              />
              <If condition={field.removeable}>
                <Button
                  onClick={() => fields.remove(index)}
                  icon={<RemoveIcon />}
                />
              </If>
            </Row>
            <If condition={shouldShowSeparator(index, field, fields)}>
              <Translate i18nKey="entry.custom-fields" parent={Heading} />
            </If>
          </Fragment>
        );
      })}
    </MetaWrapper>
    <Button
      onClick={e => {
        fields.push({
          ...createFieldDescriptor(
            null, // entry
            null, // title
            'property', // type
            '', // property
            { removeable: true }
          ),
          value: ''
        });
        e.stopPropagation();
        e.preventDefault();
      }}
      icon={<PlusIcon />}
    >
      <Translate i18nKey="entry.add-new-field" parent="span" />
    </Button>
    {touched && error && <span>{error}</span>}
  </>
);

renderMeta.propTypes = {
  fields: PropTypes.object
};

class EntryForm extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func,
    icon: PropTypes.string,
    t: PropTypes.func
  };

  render() {
    const { icon, handleSubmit, t } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FieldArray
          name="facade.fields"
          component={renderMeta}
          t={t}
          icon={icon}
        />
      </form>
    );
  }
}

export default translate()(EntryForm);
